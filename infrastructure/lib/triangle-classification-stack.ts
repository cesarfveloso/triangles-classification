import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Table, AttributeType } from 'aws-cdk-lib/aws-dynamodb';
import { RetentionDays, LogGroup } from 'aws-cdk-lib/aws-logs';
import { Integration, IntegrationType, RestApi, VpcLink } from 'aws-cdk-lib/aws-apigateway';
import {} from 'aws-cdk-lib/aws-cloudwatch';
import {} from 'aws-cdk-lib/aws-ec2';

export class TriangleClassificationStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    this.createDynamoTable();
    this.createCloudWatchLogs();
    // this.createApiGateway();
  }

  private createDynamoTable(): void {
    new Table(this, 'triangles-table', {
      tableName: 'TRIANGLES',
      partitionKey: { name: 'id', type: AttributeType.STRING },
    });
  }

  private createCloudWatchLogs(): void {
    new LogGroup(this, 'triangles-log-group', {
      retention: RetentionDays.ONE_WEEK,
      logGroupName: 'TRIANGLES-API',
    });
  }

  private createApiGateway(vpcLink: VpcLink): void {
    const api = new RestApi(this, 'triangles-api');
    const triangles = api.root.addResource('triangles');
    const classification = triangles.addResource('classification');
    const integration = new Integration({
      type: IntegrationType.AWS,
      integrationHttpMethod: 'POST',
      options: {
        vpcLink: vpcLink,
      },
      uri: '',
    });
    classification.addMethod('POST');
    const history = triangles.addResource('history');
    history.addMethod('GET');
  }
}
