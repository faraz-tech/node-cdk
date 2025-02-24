import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as ecs_patterns from 'aws-cdk-lib/aws-ecs-patterns';

export class CdkAppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const vpc = new ec2.Vpc(this, 'BookApiVpc', { maxAzs: 2 });

    const cluster = new ecs.Cluster(this, 'BookApiCluster', { vpc });

    const bucket = new s3.Bucket(this, 'BookApiS3Bucket', {
      bucketName: 'book-file-bucket',
      removalPolicy: cdk.RemovalPolicy.DESTROY, 
      autoDeleteObjects: true
    });

    const executionRole = new iam.Role(this, 'EcsExecutionRole', {
      assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AmazonECSTaskExecutionRolePolicy')
      ]
    });

    new ecs_patterns.ApplicationLoadBalancedFargateService(this, 'BookApiService', {
      cluster,
      taskImageOptions: {
        image: ecs.ContainerImage.fromRegistry('faraz2019/node-book-app:latest'),
        containerPort: 3000,
        environment: {
          MONGO_URI:'mongodb+srv://<username>:<password>@books.gv6ql.mongodb.net/?retryWrites=true&w=majority&appName=books',
          AWS_REGION: this.region,
          AWS_S3_BUCKET: bucket.bucketName
        },
        executionRole
      },
      publicLoadBalancer: true 
    });
    
  }
}
