#!/bin/sh

sed -i "s~localhost:3306~$RDS:3306~g; s~username>petclinic</jdbc~username>petclinic</jdbc~g; s~password>petclinic</jdbc~password>p3tcl1n1c</jdbc~g" pom.xml
mvn jetty:run-war  -DskipTests=true
