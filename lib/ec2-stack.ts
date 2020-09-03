import { Construct, Stack } from "@aws-cdk/core";
import { IVpc, Instance, InstanceClass, InstanceType, InstanceSize, AmazonLinuxImage, AmazonLinuxGeneration, SubnetType } from "@aws-cdk/aws-ec2";
import MyStackProps from "./my-stack-props";
import { IRole } from "@aws-cdk/aws-iam";

interface Ec2StackProps extends MyStackProps {
    vpc: IVpc;
    instanceRole: IRole;
}

export default class Ec2Stack extends Stack {
    public readonly instance: Instance;

    constructor(scope: Construct, id: string, props: Ec2StackProps) {
        super(scope, id, props);

        this.instance = new Instance(this, 'Ec2', {
            instanceName: `${props.prefix}Ec2`,
            vpc: props.vpc,
            instanceType: InstanceType.of(InstanceClass.T3A, InstanceSize.MICRO),
            machineImage: new AmazonLinuxImage({
                generation: AmazonLinuxGeneration.AMAZON_LINUX_2,
            }),
            allowAllOutbound: true,
            keyName: props.params.keyName,
            vpcSubnets: {subnetType: SubnetType.PUBLIC},
            role: props.instanceRole,            
        });
        this.instance.instance.creditSpecification = {cpuCredits: 'standard'};
        this.instance.instance.blockDeviceMappings = [{deviceName: '/dev/xvda', ebs: {volumeSize: 100, volumeType: 'gp2'}}];
        // this.instance.addUserData();
    }
}