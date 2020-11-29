#!/bin/bash
for file in "$@"; do convert "$file" "${file:0:${#file}-4}.pdf"; done