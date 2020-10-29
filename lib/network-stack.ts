import {Stack, Tag,Construct} from '@aws-cdk/core';
import {SubnetType, Vpc} from '@aws-cdk/aws-ec2';
import MyStackProps from './my-stack-props';

export default class NetWorkStack extends Stack {
  public readonly vpc: Vpc;
 
  constructor(scope: Construct, id: string, props: MyStackProps) {
    super(scope, id, props);

    this.vpc = new Vpc(this, 'Vpc', {
      enableDnsHostnames: true,
      enableDnsSupport: true,
      natGateways: 0,
      maxAzs: 2,
      subnetConfiguration: [
        {
          name: 'Public',
          subnetType: SubnetType.PUBLIC,
          cidrMask: 24,
        },
        {
          name: 'Isolated', 
          subnetType: SubnetType.ISOLATED, 
          cidrMask: 24
        },
      ],
    });
    this.vpc.node.applyAspect(new Tag('Name', `${props.prefix}Vpc`));
  }
}