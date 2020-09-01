#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { ELearningCdkStack } from '../lib/e-learning-cdk-stack';

const app = new cdk.App();
new ELearningCdkStack(app, 'ELearningCdkStack');
