#!/usr/bin/env node
import 'source-map-support/register';
import {App} from '@aws-cdk/core';
import { NetworkStack, MyStackProps, S3Stack, } from '../lib';
import RdsStack from '../lib/rds-stack';
import IamStack from '../lib/iam-stack';
import WebStack from '../lib/web-stack';
import SecurityGroupStack from '../lib/security-group-stack';
import LambdaStack from '../lib/lambda-stack';
import CodeStack from '../lib/codepipeline-stack';

const app = new App();
const props: MyStackProps = {
    project: app.node.tryGetContext('project'),
    deployEnv: app.node.tryGetContext('env'),
    domain: app.node.tryGetContext('domain'),
    zoneId: app.node.tryGetContext('zoneId'),
    certificateArn: app.node.tryGetContext('certificateArn'),
    allowIp: app.node.tryGetContext('allowIp'),
    prefix: 'ELearning',
    repositoryName: app.node.tryGetContext('repositoryName'),
    branch: app.node.tryGetContext('branch'),
    user: app.node.tryGetContext('backlog-user'),
    pass: app.node.tryGetContext('backlog-password'),
    zipFileName: app.node.tryGetContext('zipFileName'),
    params: {}
};

const networkStack: NetworkStack = new NetworkStack(app, 'NetworkStack', {
    stackName: `${props.prefix}NetworkStack`,
    ...props,
});

const iamStack: IamStack = new IamStack(app, 'IamStack', {
    stackName: `${props.prefix}IamStack`,
    ...props,
});

const securityGroupStack: SecurityGroupStack = new SecurityGroupStack(app, 'SecurityGroupStack', {
    stackName: `${props.prefix}SecurityGroupStack`,
    vpc: networkStack.vpc,
    ...props,
});

const webStack: WebStack = new WebStack(app, 'WebStack', {
    stackName: `${props.prefix}WebStack`,
    vpc: networkStack.vpc,
    instanceRole: iamStack.instanceRole,
    albSecurityGroup: securityGroupStack.albSecurityGroup,
    ec2SecurityGroup: securityGroupStack.ec2SecurityGroup,
    ...props,
});

const rdsStack: RdsStack = new RdsStack(app, 'RdsStack', {
    stackName: `${props.prefix}RdsStack`,
    vpc: networkStack.vpc,
    instance: webStack.instance,
    rdsSecurityGroup: securityGroupStack.rdsSecurityGroup,
    ...props,
});

const s3Stack: S3Stack = new S3Stack(app, 'S3Stack', {
    stackName: `${props.prefix}S3Stack`,
    ...props,
});

const lambdaStack: LambdaStack = new LambdaStack(app, 'LambdaStack', {
    stackName: `${props.prefix}LambdaStack`,
    artifactS3Bucket: s3Stack.artifactS3Bucket,
    ...props,
});

const codeStack: CodeStack = new CodeStack(app, 'CodeStack', {
    stackName: `${props.prefix}CodeStack`,
    artifactS3Bucket: s3Stack.artifactS3Bucket,
    ...props,
});
