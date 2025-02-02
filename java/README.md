# Description

Namespaces are used to separate different curves.

# Installation and Testing

To build the library and see it in action, copy all of the files in this 
directory to a fresh directory. Then execute the python3 scripts config32.py 
or config64.py (depending on whether you want a 32 or 64-bit build), and 
select the curves that you wish to support. The configured library can be 
installed using maven. 

Tests will take a while to  run.

--------------------------------------------

To create a 64-bit library

    python3 config64.py

Choose options 1, 3, 7, 23, 25, 31, 32 and 34, for example.

Once the library is configured, you can compile and install with maven:

    cd core
    mvn clean install

Testing will be carried out during the installation process.

Elliptic curve key exchange, signature and encryption (ECDH, ECDSA and ECCSI) will be tested.
Also MPIN and BLS (Boneh-Lynn-Shacham) signature (using pairings)

-------------------------------------------------

Alternatively building and testing can be combined via

    python3 configXX.py test

where XX can be 32 or 64

