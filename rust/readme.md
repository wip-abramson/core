# Description

NOTE: Updated to Rust 2018

NOTE: This version of the library requires Version 1.33+ of Rust for 64-bit 
integer support, and for Rust 2018, and also for const fn support.

Namespaces are used to separate different curves.

# Installation and Testing

To build the library and see it in action, copy all of the files in this 
directory to a fresh root directory. Then execute the python3 script 
config32.py or config64.py (depending on whether you want a 32 or 64-bit 
build), and select the curves that you wish to support. Libraries will be 
built automatically including all of the modules that you will need.

-----------------------------------------

As a quick example execute from your root directory

    python3 config64.py

Then select options 1, 3, 7, 23, 25, 31, 32 and 34 (these are fixed for 
the example program provided). Select 0 to exit.

Then copy the library from core/target/release/libcore.rlib to the
root directory, and execute

    rustc TestALL.rs --extern core=libcore.rlib

Run this test program by executing the program TestALL

    rustc TestBLS.rs --extern core=libcore.rlib

Run this test program by executing the program TestBLS

    rustc BenchtestALL.rs --extern core=libcore.rlib

Run this test program by executing the program BenchtestALL

    rustc TestNHS.rs --extern core=libcore.rlib

Run this test program by executing the program TestNHS

-------------------------------------------------

Alternatively building and testing can be combined via

    python3 configXX.py test

where XX can be 32 or 64

-------------------------------------------------

## Using MIRACL core with Cargo

Once you have built the library by running the python script, the contents of the rust folder will have changed, specifically all code files will now be under the folder core. This folder is just a rust library and can be included in any rust project.

Create a new rust project
```    cargo new mynewmiraclproject```

Copy the core folder into this new projects root directory

Finally, update the cargo.toml file in your new project to include the core library as a dependency. Here path must equal the path to the core folder, which if copied into the project should be just under the root.
```
[dependencies]
core={path="core", version="0.1.0"}
```
