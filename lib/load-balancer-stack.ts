import MyStackProps from "./my-stack-props";
import { Stack, Construct, Duration } from "@aws-cdk/core";
import { InstanceIdTarget } from '@aws-cdk/aws-elasticloadbalancingv2-targets';
import { ApplicationListener, ApplicationLoadBalancer } from '@aws-cdk/aws-elasticloadbalancingv2';
import { IVpc, IInstance, Port, Peer } from "@aws-cdk/aws-ec2";

interface AlbStackProps extends MyStackProps {
    vpc: IVpc;
    instance: IInstance;
}

export default class AlbStack extends Stack {
    public readonly alb: ApplicationLoadBalancer;

    constructor(scope: Construct, id: string, props: AlbStackProps) {
        super(scope, id, props);

        this.alb = new ApplicationLoadBalancer(this, 'Alb', {
            loadBalancerName: `${props.prefix}Alb`,
            vpc: props.vpc,
            internetFacing: true,
            idleTimeout: Duration.minutes(10),
        });

        let appListener: ApplicationListener;
        let targets: InstanceIdTarget[];
        targets = [new InstanceIdTarget(props.instance.instanceId, 80)];

        appListener = this.alb.addListener('AppListener', {port: 80});
        appListener.addTargets('AppTarget', {
            targetGroupName: `${props.prefix}AppTarget`,
            port: 80,
            targets: targets,
            healthCheck: {
                path: '/health.txt',
            }
        });

        props.instance.connections.allowFrom(this.alb, Port.tcp(80));
        props.allowIp.forEach(ip => {
            [22, 80].forEach(port => {
                props.instance.connections.allowFrom(Peer.ipv4(ip), Port.tcp(port));
            })
        });
        
    }
}