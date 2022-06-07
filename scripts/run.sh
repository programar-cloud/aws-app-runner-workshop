#!/bin/sh

echo Using RDS endpoint $RDS.
sed -i "s~localhost:3306~$RDS:3306~g; s~username>petclinic</jdbc~username>petclinic</jdbc~g; s~password>petclinic</jdbc~password>p3tcl1n1c</jdbc~g" pom.xml

echo Starting application.
mvn jetty:run-war -P MySQL -DskipTests=true
