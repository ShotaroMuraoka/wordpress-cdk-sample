import { StackProps } from '@aws-cdk/core';

export default interface MyStackProps extends StackProps {
    project: string;
    deployEnv: string;
    domain: string;
    zoneId: string;
    certificateArn: string;
    allowIp: string[];
    prefix: string;
    params: any;
    repositoryName: string;
    branch: string;
    user: string;
    pass: string;
    zipFileName: string;
    ssl: boolean;
}