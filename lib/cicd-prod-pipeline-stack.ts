
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import {
  CodePipeline,
  CodePipelineSource,
  ShellStep,
} from 'aws-cdk-lib/pipelines';
import { PipelineAppStage } from './cicdpipelinestage-stack';

import * as events from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import * as cp from 'aws-cdk-lib/aws-codepipeline';

export class CicdProdPipelineStack extends cdk.Stack {
  public static readonly PIPELINE_NAME = 'CICD-Pipeline-Prod';

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // PROD watches main but does NOT auto-trigger on push.
    const prodPipeline = new CodePipeline(this, 'ProdPipeline', {
      pipelineName: CicdProdPipelineStack.PIPELINE_NAME,
      synth: new ShellStep('Synth', {
        input: CodePipelineSource.connection(
          'VishwajeetPhalke/cicdcostdash',
          'main',
          {
            connectionArn:
              'arn:aws:codeconnections:us-east-1:430058392451:connection/b1b0d224-2619-4c1b-a7cb-b56248c3f529',
            triggerOnPush: false, // 👈 Prod will be started only by EventBridge
          }
        ),
        commands: ['npm ci', 'npm run build', 'npx cdk synth'],
      }),
    });

    // ---- PROD stage deploy ----
    prodPipeline.addStage(
      new PipelineAppStage(this, 'prod', {
        env: { account: '430058392451', region: 'us-east-1' },
      })
    );

    // ---- EventBridge: start PROD when TEST pipeline SUCCEEDS (after approval) ----
    const testPipelineName = 'CICD-Pipeline-Test';
    const prodPipelineName = CicdProdPipelineStack.PIPELINE_NAME;

    // Import the underlying CodePipeline by ARN (safe even in constructor)
    const importedProdPipeline = cp.Pipeline.fromPipelineArn(
      this,
      'ImportedProdPipeline',
      `arn:aws:codepipeline:${cdk.Stack.of(this).region}:${cdk.Stack.of(this).account}:${prodPipelineName}`
    );

    new events.Rule(this, 'TriggerProdOnTestSuccess', {
      description:
        'Start the PROD pipeline when the TEST pipeline execution succeeds (after manual approval).',
      eventPattern: {
        source: ['aws.codepipeline'],
        detailType: ['CodePipeline Pipeline Execution State Change'],
        detail: {
          pipeline: [testPipelineName],
          state: ['SUCCEEDED'],
        },
      },
      targets: [new targets.CodePipeline(importedProdPipeline)],
    });
  }
}
