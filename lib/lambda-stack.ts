// import * as cdk from 'aws-cdk-lib/core';
// import { Construct } from 'constructs';
// import * as lambda from 'aws-cdk-lib/aws-lambda';


// export class lambdaStack extends cdk.Stack {
//   constructor(scope: Construct, id: string, props?: cdk.StackProps) {
//     super(scope, id, props);
    
//     //lambda stack
//     const demolambda = new lambda.Function(this,'demolambda',{
//         handler:'index.handler',
//         runtime:lambda.Runtime.NODEJS_22_X,
//         code: lambda.Code.fromInline('exports.handler = _ => "Hello, CDK";')
//     })

//   }
// }


import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';

export class lambdaStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    new lambda.Function(this, 'demolambda', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromInline(`
        exports.handler = async () => {
          console.log("Hello from inline Lambda");
          return { statusCode: 200, body: "Hello from Sparsh and Vishwajeet" };
        };
      `),
      environment: {
        ENV: cdk.Stack.of(this).stackName,
      },
    });
  }
}
