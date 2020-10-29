#!/usr/bin/env node
import 'source-map-support/register';
import {App} from '@aws-cdk/core';
import { NetworkStack, MyStackProps, TagAspect, } from '../lib';
import RdsStack from '../lib/rds-stack';
import IamStack from '../lib/iam-stack';
import WebStack from '../lib/web-stack';
import SecurityGroupStack from '../lib/security-group-stack';

const app = new App();
const props: MyStackProps = {
    project: app.node.tryGetContext('project'),
    deployEnv: app.node.tryGetContext('deployEnv'),
    domain: app.node.tryGetContext('domain'),
    zoneId: app.node.tryGetContext('zoneId'),
    certificateArn: app.node.tryGetContext('certificateArn'),
    allowIp: app.node.tryGetContext('allowIp'),
    prefix: 'WordPress',
    user: app.node.tryGetContext('user'),
    ssl: app.node.tryGetContext('ssl'),
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

app.node.applyAspect(new TagAspect({
    "Name": `${props.project}`,
    "Creation": `${props.user} 2020/09/17`, // TODO: version情報をjsonに持つ.
    "Description": `${props.project} Resources`
}));
