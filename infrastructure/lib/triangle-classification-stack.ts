import { RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Table, AttributeType } from 'aws-cdk-lib/aws-dynamodb';
import { RetentionDays, LogGroup } from 'aws-cdk-lib/aws-logs';
import { HttpIntegration, RestApi } from 'aws-cdk-lib/aws-apigateway';
import * as s3assets from 'aws-cdk-lib/aws-s3-assets';
import * as elasticbeanstalk from 'aws-cdk-lib/aws-elasticbeanstalk';
import * as iam from 'aws-cdk-lib/aws-iam';
import config from 'config';
import { ManagedPolicy } from 'aws-cdk-lib/aws-iam';
export class TriangleClassificationStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    if (process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'development') {
      console.error('you must set NODE_ENV to production or development');
    }
    console.log(`deploying ${process.env.NODE_ENV}`);
    const cnamePrefix = this.createEb();
    this.createApiGateway(cnamePrefix);
    this.createDynamoTable();
    this.createCloudWatchLogs();
    this.givePermissionsToEBRole();
  }

  private createEb(): string {
    const appName = 'eb-triangles-api';

    const elbZipArchive = new s3assets.Asset(this, 'triangles-app-zip', {
      path: `${__dirname}/../../app.zip`,
    });

    const app = new elasticbeanstalk.CfnApplication(this, 'triangles-app', {
      applicationName: appName,
    });
    const optionSettingProperties: elasticbeanstalk.CfnEnvironment.OptionSettingProperty[] = [
      {
        namespace: 'aws:autoscaling:launchconfiguration',
        optionName: 'InstanceType',
        value: 't3.small',
      },
      {
        namespace: 'aws:autoscaling:launchconfiguration',
        optionName: 'IamInstanceProfile',
        value: 'aws-elasticbeanstalk-ec2-role',
      },
      {
        namespace: 'aws:elasticbeanstalk:application:environment',
        optionName: 'AWS_REGION',
        value: config.get('dynamoDb.region'),
      },
      {
        namespace: 'aws:elasticbeanstalk:application:environment',
        optionName: 'NODE_ENV',
        value: process.env.NODE_ENV,
      },
      {
        namespace: 'aws:elasticbeanstalk:environment',
        optionName: 'EnvironmentType',
        value: 'SingleInstance',
      },
    ];

    const appVersionProps = new elasticbeanstalk.CfnApplicationVersion(
      this,
      'triangles-app-version',
      {
        applicationName: appName,
        sourceBundle: {
          s3Bucket: elbZipArchive.s3BucketName,
          s3Key: elbZipArchive.s3ObjectKey,
        },
      }
    );

    new elasticbeanstalk.CfnEnvironment(this, 'triangles-eb-env', {
      environmentName: 'eb-triangles',
      applicationName: app.applicationName || appName,
      solutionStackName: '64bit Amazon Linux 2 v5.4.9 running Node.js 14',
      optionSettings: optionSettingProperties,
      versionLabel: appVersionProps.ref,
      cnamePrefix: appName,
    });
    appVersionProps.addDependsOn(app);
    return appName;
  }

  private createDynamoTable(): void {
    new Table(this, 'triangles-table', {
      tableName: config.get('dynamoDb.triangleTableName'),
      partitionKey: { name: 'id', type: AttributeType.STRING },
      removalPolicy: RemovalPolicy.DESTROY,
    });
  }

  private createCloudWatchLogs(): void {
    new LogGroup(this, 'triangles-log-group', {
      retention: RetentionDays.ONE_WEEK,
      logGroupName: config.get('cloudWatchLogs.groupName'),
      removalPolicy: RemovalPolicy.DESTROY,
    });
  }

  private createApiGateway(cnamePrefix?: string): void {
    const api = new RestApi(this, 'triangles-api');
    const resource = api.root.addResource('{proxy+}');
    resource.addMethod(
      'ANY',
      new HttpIntegration(`http://${cnamePrefix}.${this.region}.elasticbeanstalk.com/{proxy}`, {
        proxy: true,
        httpMethod: 'ANY',
        options: {
          requestParameters: {
            'integration.request.path.proxy': 'method.request.path.proxy',
          },
        },
      }),
      {
        requestParameters: {
          'method.request.path.proxy': true,
        },
      }
    );
  }

  private givePermissionsToEBRole() {
    const role = iam.Role.fromRoleArn(
      this,
      'role',
      `arn:aws:iam::${this.account}:role/aws-elasticbeanstalk-ec2-role`
    );
    role.addManagedPolicy(ManagedPolicy.fromAwsManagedPolicyName('CloudWatchLogsFullAccess'));
    role.addManagedPolicy(ManagedPolicy.fromAwsManagedPolicyName('AmazonDynamoDBFullAccess'));
  }
}
