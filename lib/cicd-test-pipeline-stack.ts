
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import {
  CodePipeline,
  CodePipelineSource,
  ShellStep,
  ManualApprovalStep,
} from 'aws-cdk-lib/pipelines';
import { PipelineAppStage } from './cicdpipelinestage-stack';

export class CicdTestPipelineStack extends cdk.Stack {
  public static readonly PIPELINE_NAME = 'CICD-Pipeline-Test';

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const pipeline = new CodePipeline(this, 'TestPipeline', {
      pipelineName: CicdTestPipelineStack.PIPELINE_NAME,
      synth: new ShellStep('Synth', {
        input: CodePipelineSource.connection(
          'VishwajeetPhalke/cicdcostdash', // your repo
          'main',                          // 👈 Test watches MAIN
          {
            connectionArn:
              'arn:aws:codeconnections:us-east-1:430058392451:connection/b1b0d224-2619-4c1b-a7cb-b56248c3f529',
            // triggerOnPush defaults to true -> Test auto-runs on main push/merge
          }
        ),
        commands: ['npm ci', 'npm run build', 'npx cdk synth'],
      }),
    });

    // ---- TEST stage deploy ----
    const testStage = pipeline.addStage(
      new PipelineAppStage(this, 'test', {
        env: { account: '430058392451', region: 'us-east-1' },
      })
    );

    // ---- Manual approval at the END of Test pipeline ----
    // Only after this approval will the pipeline state become "SUCCEEDED".
    testStage.addPost(
      new ManualApprovalStep('ApproveToStartProd', {
        comment: 'Approve to trigger the PROD pipeline.',
      })
    );
  }
}
