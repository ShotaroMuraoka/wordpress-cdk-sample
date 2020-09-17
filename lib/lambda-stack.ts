import MyStackProps from "./my-stack-props";
import { Stack, Construct, Duration } from "@aws-cdk/core";
import { Code, Runtime, Function } from "@aws-cdk/aws-lambda";
import { PolicyStatement } from "@aws-cdk/aws-iam";
import { RestApi, LambdaIntegration } from "@aws-cdk/aws-apigateway";
import { Bucket } from "@aws-cdk/aws-s3";

interface LambdaStackProps extends MyStackProps {
    artifactS3Bucket: Bucket;
}

export default class LambdaStack extends Stack {
    constructor(scope: Construct, id: string, props: LambdaStackProps){
        super(scope, id, props);

        const bucketName = props.artifactS3Bucket.bucketName;
        const zipFileName = props.zipFileName;
        const repositoryName = props.repositoryName;
        const branch = props.branch;

        const getFunction = new Function(this, 'get-function', {
            functionName: this.stackName + '-getSourceFromBacklog',
            code: Code.asset('lambda/deploy_package.zip'),
            handler: 'lambda_function.lambda_handler',
            runtime: Runtime.PYTHON_3_7,
            timeout: Duration.seconds(120),
            environment: {
                'BUCKET_NAME': bucketName,
                'ZIP_FILE_NAME': zipFileName,
                'REPOSITORY': repositoryName,
                'BRANCH': branch,
            },
        });
        getFunction.addToRolePolicy(new PolicyStatement({
            resources: [`arn:aws:s3:::${bucketName}/${zipFileName}`],
            actions: ['s3:putObject'],
        }));
        getFunction.addToRolePolicy(new PolicyStatement({
            resources: ['*'],
            actions: ['sts:AssumeRole', 'ssm:GetParameters'],
        }));

        const api = new RestApi(this, 'api');
        const lambdaIntegration = new LambdaIntegration(getFunction);
        api.root.addMethod('POST', lambdaIntegration);
    }
}