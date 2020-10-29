import { Stack, Construct } from "@aws-cdk/core";
import { MyStackProps } from ".";
import { IVpc, SecurityGroup, Peer, Port } from "@aws-cdk/aws-ec2";

interface SecurityGroupStackProps extends MyStackProps {
    vpc: IVpc;
}

export default class SecurityGroupStack extends Stack {
    public readonly albSecurityGroup: SecurityGroup;
    public readonly ec2SecurityGroup: SecurityGroup;
    public readonly rdsSecurityGroup: SecurityGroup;

    constructor(scope: Construct, id: string, props: SecurityGroupStackProps) {
        super(scope, id, props);

        // ALBのSG
        this.albSecurityGroup = new SecurityGroup(this, 'AlbSecurityGroup', {
            allowAllOutbound: true,
            securityGroupName: 'alb-sg',
            vpc: props.vpc,
        });

        if (!!props.ssl) {
            this.albSecurityGroup.addIngressRule(Peer.anyIpv4(), Port.tcp(443));
        } else {
            this.albSecurityGroup.addIngressRule(Peer.anyIpv4(), Port.tcp(80));
        }
        
        // EC2のSG
        this.ec2SecurityGroup = new SecurityGroup(this, 'Ec2SecurityGroup', {
            allowAllOutbound: true,
            securityGroupName: 'ec2-sg',
            vpc: props.vpc,
        });
        this.ec2SecurityGroup.addIngressRule(this.albSecurityGroup, Port.tcp(80));

        // RDSのSG
        this.rdsSecurityGroup = new SecurityGroup(this, 'RdsSecurityGroup', {
            allowAllOutbound: true,
            securityGroupName: 'rds-sg',
            vpc: props.vpc,
        });
        this.rdsSecurityGroup.addIngressRule(this.ec2SecurityGroup, Port.tcp(3306));
        this.rdsSecurityGroup.addEgressRule(this.ec2SecurityGroup, Port.tcp(3306));
    }
}