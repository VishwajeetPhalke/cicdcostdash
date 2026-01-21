// import * as cdk from 'aws-cdk-lib/core';
// import { Construct } from 'constructs';
// import {lambdaStack} from './lambda-stack';

// export class PipelineAppStage extends cdk.Stage {
//   constructor(scope: Construct, id: string, props?: cdk.StageProps) {
//     super(scope, id, props);
    
//     const lambdastack = new lambdaStack(this,'lambdastack');

//   }
// }


import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { lambdaStack } from './lambda-stack';

export class PipelineAppStage extends cdk.Stage {
  constructor(scope: Construct, id: string, props?: cdk.StageProps) {
    super(scope, id, props);

    // Add all stacks that represent your application for this environment
    new lambdaStack(this, 'lambdastack', { env: props?.env });
  }
}


