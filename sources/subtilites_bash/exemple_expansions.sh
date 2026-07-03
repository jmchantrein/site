#!/bin/bash

VAR="bonjour le monde"

TEST="* Test  $VAR"
echo
echo $TEST 
echo
echo ${TEST}
echo
echo "${TEST}"
echo
echo "----------------------------"
for local_var in $VAR; do
	echo $local_var
done
echo
for local_var in ${VAR}; do
	echo $local_var
done
echo
for local_var in "${VAR}"; do
	echo $local_var
done
echo

