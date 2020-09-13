import { Construct, Stack, RemovalPolicy } from "@aws-cdk/core";
import MyStackProps from "./my-stack-props";
import { Bucket } from "@aws-cdk/aws-s3";

export default class S3Stack extends Stack {
    public readonly artifactS3Bucket: Bucket;
    constructor(scope: Construct, id: string, props: MyStackProps) {
        super(scope, id, props);
        this.artifactS3Bucket = new Bucket(this, 'ArtifactS3Bucket', {
            bucketName: `${props.project}-${props.deployEnv}-artifact`,
            removalPolicy: RemovalPolicy.DESTROY,
            versioned: true,
        });
    }
}