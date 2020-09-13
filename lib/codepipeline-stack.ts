import MyStackProps from "./my-stack-props";
import { Stack, Construct } from "@aws-cdk/core";
import { ServerApplication, ServerDeploymentConfig, ServerDeploymentGroup, InstanceTagSet } from "@aws-cdk/aws-codedeploy";
import { Pipeline, Artifact } from "@aws-cdk/aws-codepipeline";
import { Bucket } from "@aws-cdk/aws-s3";
import { S3SourceAction, CodeDeployServerDeployAction } from "@aws-cdk/aws-codepipeline-actions";


interface CodeStackProps extends MyStackProps {
    artifactS3Bucket: Bucket;
}

export default class CodeStack extends Stack {
    constructor(scope: Construct, id: string, props: CodeStackProps) {
        super(scope, id, props);

        const pipeline: Pipeline = new Pipeline(this, 'Pipeline', {
            pipelineName: `${props.prefix}Pipeline`,
            artifactBucket: props.artifactS3Bucket,
        });

        const sourceArtifact: Artifact = new Artifact();
        const sourceAction: S3SourceAction = new S3SourceAction({
            actionName: 'S3',
            bucket: props.artifactS3Bucket,
            bucketKey: props.zipFileName,
            output: sourceArtifact,
        });
        pipeline.addStage({
            stageName: `${props.prefix}SourceStage`,
            actions: [sourceAction],
        });

        const deploy: ServerApplication = new ServerApplication(this, 'Deploy', {
            applicationName: `${props.prefix}Deploy`,
        });
        const deployGroup: ServerDeploymentGroup = new ServerDeploymentGroup(this, 'DeployGroup', {
            deploymentGroupName: `${props.prefix}DeployGroup`,
            application: deploy,
            deploymentConfig: ServerDeploymentConfig.ALL_AT_ONCE,
            ec2InstanceTags: new InstanceTagSet({ 'Name': [`${props.prefix}Ec2`] }),
        });
        const deployAction: CodeDeployServerDeployAction = new CodeDeployServerDeployAction({
            actionName: 'CodeDeploy',
            input: sourceArtifact,
            deploymentGroup: deployGroup,
        });
        pipeline.addStage({
            stageName: `${props.prefix}DeployAction`,
            actions: [deployAction],
        });
    }
}