import cdk = require('@aws-cdk/core');
import rds = require('@aws-cdk/aws-rds');
import ec2 = require('@aws-cdk/aws-ec2');

class PetclinicVPCStack extends cdk.Stack {
  readonly vpc : ec2.Vpc;
  readonly privateSubnets: ec2.SelectedSubnets;

  readonly dbSecurityGroup : ec2.SecurityGroup;
  readonly appSecurityGroup: ec2.SecurityGroup;

  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    this.vpc = new ec2.Vpc(this, 'VPC');

    this.privateSubnets = this.vpc.selectSubnets({subnetType: ec2.SubnetType.PRIVATE_WITH_NAT});

    this.dbSecurityGroup = new ec2.SecurityGroup(this, 'SG-DB', {
      vpc: this.vpc
    });
    this.appSecurityGroup = new ec2.SecurityGroup(this, 'SG-APP', {
      vpc: this.vpc
    });
    this.dbSecurityGroup.addIngressRule(this.appSecurityGroup, ec2.Port.tcp(3306), 'Mysql default port for the app layer');
    this.appSecurityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(8080), 'App port from anywhere');

    new cdk.CfnOutput(this, 'appSecurityGroup', {
      value: this.appSecurityGroup.securityGroupId,
      description: 'Security group for the application.',
      exportName: 'appSecurityGroup'
    });    
  }
}

class PetclinicDBStack extends cdk.Stack {
  readonly mysql: rds.DatabaseInstance;
  
  constructor(scope: cdk.App, id: string, 
              vpc: ec2.Vpc, privateSubnets: ec2.SelectedSubnets, 
              dbSecurityGroup : ec2.SecurityGroup,
              props?: cdk.StackProps) {
    super(scope, id, props);

    this.mysql = new rds.DatabaseInstance(this, 'DB-MAIN', {
      databaseName : 'petclinic',
      instanceIdentifier : 'PETCLINIC-DB',
      engine : rds.DatabaseInstanceEngine.mysql({
        version: rds.MysqlEngineVersion.VER_5_7_34
      }),       
      vpc : vpc,
      vpcSubnets : privateSubnets,
      securityGroups: [dbSecurityGroup],
      deletionProtection : false,
      multiAz : false,
      credentials : {
        username : 'petclinic',
        password : cdk.SecretValue.plainText('p3tcl1n1c')
      }
    });
    new cdk.CfnOutput(this, 'dbURL', {
      value: this.mysql.dbInstanceEndpointAddress,
      description: 'Database instance endpoint.',
      exportName: 'dbEndpoint'
    });    
  }
}

const app = new cdk.App();

const globalTags = {
  'project' : 'aws-app-runner-workshop',
  'owner' : process.env.USER!
};

const vpcStack = new PetclinicVPCStack(app, 'petclinic-VPC-' + process.env.USER, {
  tags: globalTags
});

const dbStack = new PetclinicDBStack(app, 'petclinic-DB-' + process.env.USER, 
  vpcStack.vpc, vpcStack.privateSubnets, vpcStack.dbSecurityGroup, {
  tags: globalTags
});
dbStack.addDependency(vpcStack);

