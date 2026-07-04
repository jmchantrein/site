#!/usr/bin/env bats
# A minimal Bats test: run a command, assert on its exit status.

@test "Test de la commande ls" {
    run ls
    [ "$status" -eq 0 ]  # The command must succeed (exit code 0).
}
