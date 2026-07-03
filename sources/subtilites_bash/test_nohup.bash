#!/bin/bash

function ___print_ppid_and_pid ()
{
  echo -n "PPID: "
  ps -o ppid= "${$}"
  echo "PID: ${$}"
  return 0
}

function main ()
{
  ___print_ppid_and_pid

  export -f ___print_ppid_and_pid
  nohup bash -c ___print_ppid_and_pid &
  return 0
}

main "${@}"
exit 0
