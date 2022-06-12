# Workshop infraestructure

## Scenario

The project deploys:

* A VPC with public and private parts, and the corresponding NAT-gw
* A Postgres instance
* Explicit security groups, with centralized configuration at network level

## Todo

The database credentials are stored in plaintext instead of being obtained from
an already-existing secret. That's practical for a demo, but not acceptable for
production.

Also, those credentials are inserted in the source code of the application (in particular,
in `pom.xml` file) using the user-data.

A future version will handle this situation in a more elegant way. Also, it would be
advisable to directly deploy the artifact instead of requiring its compilation... but
that would force us to stop using the [official Spring repository](https://github.com/spring-petclinic/spring-framework-petclinic).

## Running the demo

* Install `node`

```bash
curl -L https://git.io/n-install | bash
. $HOME/.bashrc 

node --version
npm --version
```

* Clone the repo and navigate to this folder

```bash
git clone https://github.com/ciberado/aws-app-runner-workshop
cd aws-app-runner-workshop/cicd/cdk
```

* Compile and check the stack

```bash
npm run build
npx cdk synth
```

* Init the cdk assets

```bash
npx cdk bootstrap
```

* Deploy the stack

```bash
npx cdk deploy --all --require-approval never
```

The output of the last stack will contain the http address of the load balancer.


## Clean up

* Just delete de stack

```bash
npx cdk destroy --all
```
