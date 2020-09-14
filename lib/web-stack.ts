import MyStackProps from "./my-stack-props";
import { Stack, Construct, Duration } from "@aws-cdk/core";
import { InstanceIdTarget } from '@aws-cdk/aws-elasticloadbalancingv2-targets';
import { ApplicationListener, ApplicationLoadBalancer } from '@aws-cdk/aws-elasticloadbalancingv2';
import { IVpc, Port, Instance, InstanceType, InstanceClass, InstanceSize, AmazonLinuxImage, AmazonLinuxGeneration, SubnetType, SecurityGroup } from "@aws-cdk/aws-ec2";
import { IRole } from "@aws-cdk/aws-iam";

interface WebStackProps extends MyStackProps {
    vpc: IVpc;
    instanceRole: IRole;
    albSecurityGroup: SecurityGroup;
    ec2SecurityGroup: SecurityGroup;
}

export default class WebStack extends Stack {
    public readonly instance: Instance;
    public readonly alb: ApplicationLoadBalancer;

    constructor(scope: Construct, id: string, props: WebStackProps) {
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
            securityGroup: props.ec2SecurityGroup,
        });

        this.instance.instance.creditSpecification = {cpuCredits: 'standard'};
        this.instance.instance.blockDeviceMappings = [{deviceName: '/dev/xvda', ebs: {volumeSize: 100, volumeType: 'gp2'}}];
        this.instance.addUserData(
            'yum -y update',
            'yum -y install wget git ruby',
            'amazon-linux-extras install -y docker',
            'systemctl enable docker',
            'systemctl start docker',
            'curl -L "https://github.com/docker/compose/releases/download/1.26.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose',
            'chmod +x /usr/local/bin/docker-compose',
            'wget https://aws-codedeploy-ap-northeast-1.s3.ap-northeast-1.amazonaws.com/latest/install',
            'chmod +x ./install',
            './install auto',
            'systemctl enable codedeploy-agent',
            'systemctl start codedeploy-agent',
        );

        this.alb = new ApplicationLoadBalancer(this, 'Alb', {
            loadBalancerName: `${props.prefix}Alb`,
            vpc: props.vpc,
            internetFacing: true,
            idleTimeout: Duration.minutes(10),
            securityGroup: props.albSecurityGroup,
        });

        let appListener: ApplicationListener;
        let targets: InstanceIdTarget[];
        targets = [new InstanceIdTarget(this.instance.instanceId, 80)];

        if (!!props.ssl) {
            appListener = this.alb.addListener('AppListener', {port: 443});
            appListener.addCertificates('AppCertificateArns', [{certificateArn: props.certificateArn}]);
        } else {
            appListener = this.alb.addListener('AppListener', {port: 80});
        }
        
        appListener.addTargets('AppTarget', {
            targetGroupName: `${props.prefix}AppTarget`,
            port: 80,
            targets: targets,
            healthCheck: {
                path: '/health.txt',
            }
        });

        // TODO: ALB-EC2はhttp通信になることを留意すること.
        // this.instance.connections.allowFrom(this.alb, Port.tcp(80));
        // props.allowIp.forEach(ip => {
        //     [22, 80].forEach(port => {
        //         this.instance.connections.allowFrom(Peer.ipv4(ip), Port.tcp(port));
        //     })
        // });
    }
}