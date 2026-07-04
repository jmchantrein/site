#!/usr/bin/env bats
# Unit tests of the course's solution scripts — run by the harness
# (scripts/test-solutions-bash.sh). The code shown in the course IS
# the code tested here.

setup() {
    dir="$(mktemp -d)"
    printf 'a\n' > "$dir/un.txt"
    printf 'b\n' > "$dir/deux.txt"
}

teardown() {
    rm -rf "$dir"
}

@test "liste_fichiers: lists the files of an existing directory" {
    run bash "$BATS_TEST_DIRNAME/liste_fichiers.bash" <<< "$dir"
    [ "$status" -eq 0 ]
    [[ "$output" == *"un.txt"* && "$output" == *"deux.txt"* ]]
}

@test "liste_fichiers: exit code 1 on a missing directory" {
    run bash "$BATS_TEST_DIRNAME/liste_fichiers.bash" <<< "/nulle/part"
    [ "$status" -eq 1 ]
}

@test "copie_fichiers: copies into a created destination" {
    run bash "$BATS_TEST_DIRNAME/copie_fichiers.bash" <<< "$dir
$dir-copie"
    [ "$status" -eq 0 ]
    [ -f "$dir-copie/un.txt" ]
    rm -rf "$dir-copie"
}

@test "copie_fichiers: exit code 1 on a missing source" {
    run bash "$BATS_TEST_DIRNAME/copie_fichiers.bash" <<< "/nulle/part
$dir-copie"
    [ "$status" -eq 1 ]
}

@test "exemple_argument: prints its positional parameters" {
    run bash "$BATS_TEST_DIRNAME/exemple_argument.bash" alpha beta
    [ "$status" -eq 0 ]
    [[ "$output" == *"alpha"* && "$output" == *"beta"* ]]
}

@test "exemple_main_function: computes 5 + 10" {
    run bash "$BATS_TEST_DIRNAME/exemple_main_function.bash"
    [ "$status" -eq 0 ]
    [[ "$output" == *"La somme de 5 et 10 est 15"* ]]
}

@test "exemple_saisie: greets the given name" {
    run bash "$BATS_TEST_DIRNAME/exemple_saisie.bash" <<< "Ada"
    [ "$status" -eq 0 ]
    [[ "$output" == *"Bonjour, Ada!"* ]]
}
