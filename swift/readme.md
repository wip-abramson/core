# Description

NEW: 7/10/2018 classes replaced with structs, which are *much* faster (~50%).
Who knew? Unfortunately Swift performance (as of 4.2) continues to be 
crucified by its lack of support for short fixed length arrays allocated 
from the stack. Instead they are allocated as variable length from the heap, 
so the code spends more time doing garbage collection than doing crypto.

Each supported primitive is implemented inside of its own swift namespace. 

So for example to support both ed25519 and the NIST P256 curves, one
could import into a particular module both "ed25519" and "nist256"

Separate ROM files provide the constants required for each curve. Some
files (big.swift, fp.swift, ecp.swift) also specify certain constants 
that must be set for the particular curve.

# Installation and Testing

To build the library and see it in action, copy all of the files in this 
directory to a fresh root directory. Then execute the python3 script 
config32.py or config64.py (depending om whether you want a 32 or 
64-bit build), and select the curves that you wish to support. Libraries 
will be built automatically including all of the modules that you will need.

-------------------------------------------------

To create a 64-bit library

    python3 config64.py

Then select options 1, 3, 7, 23, 25, 31, 32 and 34 (these are fixed for the 
example program provided). Select 0 to exit.

Then execute

    swift -I. -L. -lcore -led25519 -lnist256 -lgoldilocks -lbn254 -lbls12383 -lbls24479 -lbls48556 -lrsa2048 TestALL.swift 

and

    swift -I. -L. -lcore -lbn254 -lbls383 -lbls24 -lbls48 TestBLS.swift 

and 

    swift -I. -L. -lcore -led25519 -lnist256 -lgoldilocks -lbn254 -lbls12383 -lbls24479 -lbls48556 -lrsa2048 BenchtestALL.swift 

Also

    swift -I. -L. -lcore TestNHS.swift

(Alternatively compile using swiftc rather than swift. However to run the 
programs the individual libraries need to be moved to /usr/lib (or somewhere 
OS specific). Note that the regular swiftc compiler seems to be more robust 
than the JIT swift compiler (there is a known bug in swift 5.0)

So for example

    swiftc -I. -L. -lcore -lbn254 -lbls12383 -lbls24479 -lbls48556 TestBLS.swift 
    sudo cp lib*.so /usr/lib/.
    ./TestBLS

-------------------------------------------------

Alternatively building and testing can be combined via

    python3 configXX.py test

where XX can be 32 or 64
