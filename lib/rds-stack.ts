import { Stack, Construct, RemovalPolicy } from "@aws-cdk/core";
import { IVpc, IInstance, InstanceType, InstanceClass, InstanceSize, SubnetType, SecurityGroup } from "@aws-cdk/aws-ec2";
import { DatabaseInstance, DatabaseInstanceEngine} from "@aws-cdk/aws-rds";
import MyStackProps from "./my-stack-props";

interface RdsStackProps extends MyStackProps {
    vpc: IVpc;
    instance: IInstance;
    rdsSecurityGroup: SecurityGroup;
}

export default class RdsStack extends Stack {
    constructor(scope: Construct, id: string, props: RdsStackProps){
        super(scope, id, props);

        const instance: DatabaseInstance = new DatabaseInstance(this, 'Rds', {
            instanceIdentifier: `${props.project}-${props.deployEnv}`,
            databaseName: `${props.prefix}Db`,
            engine: DatabaseInstanceEngine.MYSQL,
            engineVersion: '5.7.30',
            instanceClass: InstanceType.of(InstanceClass.T3, InstanceSize.MICRO),
            masterUsername: 'pman',
            vpc: props.vpc,
            vpcPlacement: {subnetType: SubnetType.ISOLATED},
            deletionProtection: false,
            removalPolicy: RemovalPolicy.DESTROY,
            securityGroups: [props.rdsSecurityGroup],
        });
    }

}