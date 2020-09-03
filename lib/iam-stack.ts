import { Stack, isResolvableObject, Construct } from "@aws-cdk/core"
import { IRole, Role, ServicePrincipal, ManagedPolicy } from "@aws-cdk/aws-iam";
import { MyStackProps } from ".";

export default class IamStack extends Stack {
    public readonly instanceRole: IRole;

    constructor(scope: Construct, id: string, props: MyStackProps) {
        super(scope, id, props);
        
        this.instanceRole = new Role(this, 'IamRoleInstance', {
            roleName: `${props.prefix}InstanceRole`,
            assumedBy: new ServicePrincipal('ec2.amazonaws.com'),
            managedPolicies: [
                // ManagedPolicy.fromAwsManagedPolicyName('AmazonS3FullAccess'),
                ManagedPolicy.fromAwsManagedPolicyName('AmazonEC2ContainerRegistryReadOnly'),
                // ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMReadOnlyAccess'),
                // ManagedPolicy.fromAwsManagedPolicyName('CloudWatchLogsFullAccess'),
            ]
        });
    }
}