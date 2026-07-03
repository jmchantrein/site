#!/usr/bin/env bats

@test "Test de la commande ls" {
    run ls
    [ "$status" -eq 0 ]  # Vérifie que la commande réussit
}