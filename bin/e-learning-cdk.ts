#!/usr/bin/env node
import 'source-map-support/register';
import {App} from '@aws-cdk/core';
import { NetworkStack, MyStackProps, } from '../lib';
import Ec2Stack from '../lib/ec2-stack';
import IamStack from '../lib/iam-stack';

const app = new App();
const props: MyStackProps = {
    project: app.node.tryGetContext('project'),
    deployEnv: app.node.tryGetContext('env'),
    domain: app.node.tryGetContext('domain'),
    zoneId: app.node.tryGetContext('zoneId'),
    certificateArn: app.node.tryGetContext('certificateArn'),
    allowIp: app.node.tryGetContext('allowIp'),
    prefix: 'E-Learning',
    params: {}
};

const networkStack: NetworkStack = new NetworkStack(app, 'NetworkStack', {
    stackName: `${props.prefix}NetworkStack`,
    ...props,
});
const iamStack: IamStack = new IamStack(app, 'IamStack', {
    stackName: `${props.prefix}IamStack`,
    ...props,
})
const ec2Stack: Ec2Stack = new Ec2Stack(app, 'Ec2Stack', {
    stackName: `${props.prefix}Ec2Stack`,
    vpc: networkStack.vpc,
    instanceRole: iamStack.instanceRole,
    ...props,
});