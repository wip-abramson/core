/*
   Copyright (C) 2019 MIRACL UK Ltd.

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as
    published by the Free Software Foundation, either version 3 of the
    License, or (at your option) any later version.


    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

     https://www.gnu.org/licenses/agpl-3.0.en.html

    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.

   You can be released from the requirements of the license by purchasing     
   a commercial license. Buying such a license is mandatory as soon as you
   develop commercial activities involving the MIRACL Core Crypto SDK
   without disclosing the source code of your own applications, or shipping
   the MIRACL Core Crypto SDK with a closed source product.     
*/

var CTX = function(input_parameter) {
    "use strict";

    var ctx = this,
        CTXLIST,
        prepareModule;

    CTXLIST = {
        "ED25519": {
            "BITS": "256",
            "FIELD": "25519",
            "CURVE": "ED25519",
            "@NB": 32,      /* Number of bytes in Modulus */
            "@BASE": 24,    /* Number base as power of 2 */
            "@NBT": 255,    /* Number of bits in modulus */
            "@M8": 2,       /* Modulus mod 8 */
            "@MT": 1,       /* Modulus Type (pseudo-mersenne,...) */
			"@QI": 0,		/* Fp2 QNR */
			"@TW": 0,		/* Tower type */
            "@CT": 1,       /* Curve Type (Weierstrass,...) */
            "@PF": 0,       /* Pairing Friendly */
            "@ST": 0,       /* Sextic Twist Type */
            "@SX": 0,       /* Sign of x parameter */
            "@AB": 0,       /* ATE parameter size */
            "@HT": 32,      /* Hash output size */
			"@SH": 9,       /* Maximum field excess */
            "@AK": 16       /* AES key size */
        },

        "X448": {
            "BITS": "448",
            "FIELD": "GOLDILOCKS",
            "CURVE": "X448",
            "@NB": 56,
            "@BASE": 23,
            "@NBT": 448,
            "@M8": 1,
            "@MT": 2,
			"@QI": 0,
			"@TW": 0,
            "@CT": 2,
            "@PF": 0,
            "@ST": 0,
            "@SX": 0,
            "@AB": 0,
            "@HT": 64,
			"@SH": 11, 
            "@AK": 32
        },

        "SECP160R1": {
            "BITS": "160",
            "FIELD": "SECP160R1",
            "CURVE": "SECP160R1",
            "@NB": 20,
            "@BASE": 24,
            "@NBT": 160,
            "@M8": 1,
            "@MT": 0,
			"@QI": 0,
			"@TW": 0,
            "@CT": 0,
            "@PF": 0,
            "@ST": 0,
            "@SX": 0,
            "@AB": 0,
            "@HT": 32,
			"@SH": 8, 
            "@AK": 16
        },

        "C25519": {
            "BITS": "256",
            "FIELD": "25519",
            "CURVE": "C25519",
            "@NB": 32,
            "@BASE": 24,
            "@NBT": 255,
            "@M8": 2,
            "@MT": 1,
			"@QI": 0,
			"@TW": 0,
            "@CT": 2,
            "@PF": 0,
            "@ST": 0,
            "@SX": 0,
            "@AB": 0,
            "@HT": 32,
			"@SH": 9, 
            "@AK": 16
        },


        "C13318": {
            "BITS": "256",
            "FIELD": "25519",
            "CURVE": "C13318",
            "@NB": 32,
            "@BASE": 24,
            "@NBT": 255,
            "@M8": 2,
            "@MT": 1,
			"@QI": 0,
			"@TW": 0,
            "@CT": 0,
            "@PF": 0,
            "@ST": 0,
            "@SX": 0,
            "@AB": 0,
            "@HT": 32,
			"@SH": 9, 
            "@AK": 16
        },

        "JUBJUB": {
            "BITS": "256",
            "FIELD": "JUBJUB",
            "CURVE": "JUBJUB",
            "@NB": 32,
            "@BASE": 24,
            "@NBT": 255,
            "@M8": 32,
            "@MT": 0,
			"@QI": 5,
			"@TW": 0,
            "@CT": 1,
            "@PF": 0,
            "@ST": 0,
            "@SX": 0,
            "@AB": 0,
            "@HT": 32,
			"@SH": 9, 
            "@AK": 16
        },

        "SECP256K1": {
            "BITS": "256",
            "FIELD": "SECP256K1",
            "CURVE": "SECP256K1",
            "@NB": 32,
            "@BASE": 24,
            "@NBT": 256,
            "@M8": 1,
            "@MT": 0,
			"@QI": 0,
			"@TW": 0,
            "@CT": 0,
            "@PF": 0,
            "@ST": 0,
            "@SX": 0,
            "@AB": 0,
            "@HT": 32,
			"@SH": 8, 
            "@AK": 16
        },

        "NIST256": {
            "BITS": "256",
            "FIELD": "NIST256",
            "CURVE": "NIST256",
            "@NB": 32,
            "@BASE": 24,
            "@NBT": 256,
            "@M8": 1,
            "@MT": 0,
			"@QI": 0,
			"@TW": 0,
            "@CT": 0,
            "@PF": 0,
            "@ST": 0,
            "@SX": 0,
            "@AB": 0,
            "@HT": 32,
			"@SH": 8, 
            "@AK": 16
        },

        "SM2": {
            "BITS": "256",
            "FIELD": "SM2",
            "CURVE": "SM2",
            "@NB": 32,
            "@BASE": 24,
            "@NBT": 256,
            "@M8": 1,
            "@MT": 0,
			"@QI": 0,
			"@TW": 0,
            "@CT": 0,
            "@PF": 0,
            "@ST": 0,
            "@SX": 0,
            "@AB": 0,
            "@HT": 32,
			"@SH": 8, 
            "@AK": 16
        },

        "NIST384": {
            "BITS": "384",
            "FIELD": "NIST384",
            "CURVE": "NIST384",
            "@NB": 48,
            "@BASE": 23,
            "@NBT": 384,
            "@M8": 1,
            "@MT": 0,
			"@QI": 0,
			"@TW": 0,
            "@CT": 0,
            "@PF": 0,
            "@ST": 0,
            "@SX": 0,
            "@AB": 0,
            "@HT": 48,
			"@SH": 7, 
            "@AK": 24
        },

        "BRAINPOOL": {
            "BITS": "256",
            "FIELD": "BRAINPOOL",
            "CURVE": "BRAINPOOL",
            "@NB": 32,
            "@BASE": 24,
            "@NBT": 256,
            "@M8": 1,
            "@MT": 0,
			"@QI": 0,
			"@TW": 0,
            "@CT": 0,
            "@PF": 0,
            "@ST": 0,
            "@SX": 0,
            "@AB": 0,
            "@HT": 32,
			"@SH": 8, 
            "@AK": 16
        },

        "ANSSI": {
            "BITS": "256",
            "FIELD": "ANSSI",
            "CURVE": "ANSSI",
            "@NB": 32,
            "@BASE": 24,
            "@NBT": 256,
            "@M8": 1,
            "@MT": 0,
			"@QI": 0,
			"@TW": 0,
            "@CT": 0,
            "@PF": 0,
            "@ST": 0,
            "@SX": 0,
            "@AB": 0,
            "@HT": 32,
			"@SH": 8, 
            "@AK": 16
        },

        "HIFIVE": {
            "BITS": "336",
            "FIELD": "HIFIVE",
            "CURVE": "HIFIVE",
            "@NB": 42,
            "@BASE": 23,
            "@NBT": 336,
            "@M8": 2,
            "@MT": 1,
			"@QI": 0,
			"@TW": 0,
            "@CT": 1,
            "@PF": 0,
            "@ST": 0,
            "@SX": 0,
            "@AB": 0,
            "@HT": 48,
			"@SH": 9, 
            "@AK": 24
        },

        "GOLDILOCKS": {
            "BITS": "448",
            "FIELD": "GOLDILOCKS",
            "CURVE": "GOLDILOCKS",
            "@NB": 56,
            "@BASE": 23,
            "@NBT": 448,
            "@M8": 1,
            "@MT": 2,
			"@QI": 0,
			"@TW": 0,
            "@CT": 1,
            "@PF": 0,
            "@ST": 0,
            "@SX": 0,
            "@AB": 0,
            "@HT": 64,
			"@SH": 11, 
            "@AK": 32
        },

        "C41417": {
            "BITS": "416",
            "FIELD": "C41417",
            "CURVE": "C41417",
            "@NB": 52,
            "@BASE": 22,
            "@NBT": 414,
            "@M8": 1,
            "@MT": 1,
			"@QI": 0,
			"@TW": 0,
            "@CT": 1,
            "@PF": 0,
            "@ST": 0,
            "@SX": 0,
            "@AB": 0,
            "@HT": 64,
			"@SH": 4, 
            "@AK": 32
        },

        "NIST521": {
            "BITS": "528",
            "FIELD": "NIST521",
            "CURVE": "NIST521",
            "@NB": 66,
            "@BASE": 23,
            "@NBT": 521,
            "@M8": 1,
            "@MT": 1,
			"@QI": 0,
			"@TW": 0,
            "@CT": 0,
            "@PF": 0,
            "@ST": 0,
            "@SX": 0,
            "@AB": 0,
            "@HT": 64,
			"@SH": 8, 
            "@AK": 32
        },

        "NUMS256W": {
            "BITS": "256",
            "FIELD": "256PM",
            "CURVE": "NUMS256W",
            "@NB": 32,
            "@BASE": 24,
            "@NBT": 256,
            "@M8": 1,
            "@MT": 1,
			"@QI": 0,
			"@TW": 0,
            "@CT": 0,
            "@PF": 0,
            "@ST": 0,
            "@SX": 0,
            "@AB": 0,
            "@HT": 32,
			"@SH": 8, 
            "@AK": 16
        },

        "NUMS256E": {
            "BITS": "256",
            "FIELD": "256PM",
            "CURVE": "NUMS256E",
            "@NB": 32,
            "@BASE": 24,
            "@NBT": 256,
            "@M8": 1,
            "@MT": 1,
			"@QI": 0,
			"@TW": 0,
            "@CT": 1,
            "@PF": 0,
            "@ST": 0,
            "@SX": 0,
            "@AB": 0,
            "@HT": 32,
			"@SH": 8, 
            "@AK": 16
        },

        "NUMS384W": {
            "BITS": "384",
            "FIELD": "384PM",
            "CURVE": "NUMS384W",
            "@NB": 48,
            "@BASE": 23,
            "@NBT": 384,
            "@M8": 1,
            "@MT": 1,
			"@QI": 0,
			"@TW": 0,
            "@CT": 0,
            "@PF": 0,
            "@ST": 0,
            "@SX": 0,
            "@AB": 0,
            "@HT": 48,
			"@SH": 7, 
            "@AK": 24
        },

        "NUMS384E": {
            "BITS": "384",
            "FIELD": "384PM",
            "CURVE": "NUMS384E",
            "@NB": 48,
            "@BASE": 23,
            "@NBT": 384,
            "@M8": 1,
            "@MT": 1,
			"@QI": 0,
			"@TW": 0,
            "@CT": 1,
            "@PF": 0,
            "@ST": 0,
            "@SX": 0,
            "@AB": 0,
            "@HT": 48,
			"@SH": 7, 
            "@AK": 24
        },

        "NUMS512W": {
            "BITS": "512",
            "FIELD": "512PM",
            "CURVE": "NUMS512W",
            "@NB": 64,
            "@BASE": 23,
            "@NBT": 512,
            "@M8": 1,
            "@MT": 1,
			"@QI": 0,
			"@TW": 0,
            "@CT": 0,
            "@PF": 0,
            "@ST": 0,
            "@SX": 0,
            "@AB": 0,
            "@HT": 64,
			"@SH": 11, 
            "@AK": 32
        },

        "NUMS512E": {
            "BITS": "512",
            "FIELD": "512PM",
            "CURVE": "NUMS512E",
            "@NB": 64,
            "@BASE": 23,
            "@NBT": 512,
            "@M8": 1,
            "@MT": 1,
			"@QI": 0,
			"@TW": 0,
            "@CT": 1,
            "@PF": 0,
            "@ST": 0,
            "@SX": 0,
            "@AB": 0,
            "@HT": 64,
			"@SH": 11, 
            "@AK": 32
        },

        "FP256BN": {
            "BITS": "256",
            "FIELD": "FP256BN",
            "CURVE": "FP256BN",
            "@NB": 32,
            "@BASE": 24,
            "@NBT": 256,
            "@M8": 1,
            "@MT": 0,
			"@QI": 0,
			"@TW": 0,
            "@CT": 0,
            "@PF": 1,
            "@ST": 1,
            "@SX": 1,
            "@AB": 66,
            "@HT": 32,
			"@SH": 8, 
            "@AK": 16
        },

        "FP512BN": {
            "BITS": "512",
            "FIELD": "FP512BN",
            "CURVE": "FP512BN",
            "@NB": 64,
            "@BASE": 23,
            "@NBT": 512,
            "@M8": 1,
            "@MT": 0,
			"@QI": 0,
			"@TW": 0,
            "@CT": 0,
            "@PF": 1,
            "@ST": 1,
            "@SX": 0,
            "@AB": 130,
            "@HT": 32,
			"@SH": 11, 
            "@AK": 16
        },

        "BN254": {
            "BITS": "256",
            "FIELD": "BN254",
            "CURVE": "BN254",
            "@NB": 32,
            "@BASE": 24,
            "@NBT": 254,
            "@M8": 1,
            "@MT": 0,
			"@QI": 0,
			"@TW": 0,
            "@CT": 0,
            "@PF": 1,
            "@ST": 0,
            "@SX": 1,
            "@AB": 66,
            "@HT": 32,
			"@SH": 10, 
            "@AK": 16
        },

        "BN254CX": {
            "BITS": "256",
            "FIELD": "BN254CX",
            "CURVE": "BN254CX",
            "@NB": 32,
            "@BASE": 24,
            "@NBT": 254,
            "@M8": 1,
            "@MT": 0,
			"@QI": 0,
			"@TW": 0,
            "@CT": 0,
            "@PF": 1,
            "@ST": 0,
            "@SX": 1,
            "@AB": 66,
            "@HT": 32,
			"@SH": 10, 
            "@AK": 16
        },

        "BN462": {
            "BITS": "464",
            "FIELD": "BN462",
            "CURVE": "BN462",
            "@NB": 58,
            "@BASE": 23,
            "@NBT": 462,
            "@M8": 1,
            "@MT": 0,
			"@QI": 1,
			"@TW": 0,
            "@CT": 0,
            "@PF": 1,
            "@ST": 0,
            "@SX": 0,
            "@AB": 118,
            "@HT": 32,
			"@SH": 11, 
            "@AK": 16
        },

        "BLS12383": {
            "BITS": "384",
            "FIELD": "BLS12383",
            "CURVE": "BLS12383",
            "@NB": 48,
            "@BASE": 23,
            "@NBT": 383,
            "@M8": 1,
            "@MT": 0,
			"@QI": 0,
			"@TW": 0,
            "@CT": 0,
            "@PF": 2,
            "@ST": 1,
            "@SX": 0,
            "@AB": 65,
            "@HT": 32,
			"@SH": 8, 
            "@AK": 16
        },

        "BLS24479": {
            "BITS": "480",
            "FIELD": "BLS24479",
            "CURVE": "BLS24479",
            "@NB": 60,
            "@BASE": 23,
            "@NBT": 479,
            "@M8": 1,
            "@MT": 0,
			"@QI": 0,
			"@TW": 0,
            "@CT": 0,
            "@PF": 3,
            "@ST": 1,
            "@SX": 0,
            "@AB": 49,
            "@HT": 48,
			"@SH": 4, 
            "@AK": 24
        },

        "BLS48556": {
            "BITS": "560",
            "FIELD": "BLS48556",
            "CURVE": "BLS48556",
            "@NB": 70,
            "@BASE": 23,
            "@NBT": 556,
            "@M8": 1,
            "@MT": 0,
			"@QI": 0,
			"@TW": 0,
            "@CT": 0,
            "@PF": 4,
            "@ST": 1,
            "@SX": 0,
            "@AB": 32,
            "@HT": 64,
			"@SH": 11, 
            "@AK": 32
        },

        "BLS48581": {
            "BITS": "584",
            "FIELD": "BLS48581",
            "CURVE": "BLS48581",
            "@NB": 73,
            "@BASE": 23,
            "@NBT": 581,
            "@M8": 1,
            "@MT": 0,
			"@QI": 0,
			"@TW": 1,
            "@CT": 0,
            "@PF": 4,
            "@ST": 0,
            "@SX": 1,
            "@AB": 33,
            "@HT": 64,
			"@SH": 11, 
            "@AK": 32
        },

        "BLS12381": {
            "BITS": "381",
            "FIELD": "BLS12381",
            "CURVE": "BLS12381",
            "@NB": 48,
            "@BASE": 23,
            "@NBT": 381,
            "@M8": 1,
            "@MT": 0,
			"@QI": 0,
			"@TW": 0,
            "@CT": 0,
            "@PF": 2,
            "@ST": 1,
            "@SX": 1,
            "@AB": 65,
            "@HT": 32,
			"@SH": 10, 
            "@AK": 16
        },

        "BLS12461": {
            "BITS": "464",
            "FIELD": "BLS12461",
            "CURVE": "BLS12461",
            "@NB": 58,
            "@BASE": 23,
            "@NBT": 461,
            "@M8": 1,
            "@MT": 0,
			"@QI": 0,
			"@TW": 0,
            "@CT": 0,
            "@PF": 2,
            "@ST": 1,
            "@SX": 1,
            "@AB": 78,
            "@HT": 32,
			"@SH": 11, 
            "@AK": 16
        },

        "RSA2048": {
            "BITS": "1024",
            "TFF": "2048",
            "@NB": 128,
            "@BASE": 22,
            "@ML": 2,
        },

        "RSA3072": {
            "BITS": "384",
            "TFF": "3072",
            "@NB": 48,
            "@BASE": 23,
            "@ML": 8,
        },

        "RSA4096": {
            "BITS": "512",
            "TFF": "4096",
            "@NB": 64,
            "@BASE": 23,
            "@ML": 8,
        },
    };

    prepareModule = function (moduleName, fileName, propertyName) {
        if (!propertyName) {
            propertyName = moduleName;
        }

        if (typeof require !== "undefined") {
            if (!fileName) {
                fileName = moduleName.toLowerCase();
            }

            ctx[propertyName] = require("./" + fileName)[moduleName](ctx);
        } else {
            ctx[propertyName] = window[moduleName](ctx);
        }
    };

    prepareModule("AES");
    prepareModule("GCM");
    prepareModule("UInt64");
    prepareModule("HMAC");
    prepareModule("HASH256");
    prepareModule("HASH384");
    prepareModule("HASH512");
    prepareModule("SHA3");
    prepareModule("RAND");
    prepareModule("NHS");

    if (typeof input_parameter === "undefined") {
        return;
    }

    ctx.config = CTXLIST[input_parameter];

    // Set BIG parameters
    prepareModule("BIG");
    prepareModule("DBIG", "big");

    // Set RSA parameters
    if (typeof ctx.config["TFF"] !== "undefined") {
        prepareModule("FF");
        prepareModule("RSA");
        prepareModule("rsa_public_key", "rsa");
        prepareModule("rsa_private_key", "rsa");
        return;
    }

    // Set Elliptic Curve parameters
    if (typeof ctx.config["CURVE"] !== "undefined") {
        prepareModule("ROM_CURVE_" + ctx.config["CURVE"], "rom_curve", "ROM_CURVE");

        prepareModule("ROM_FIELD_" + ctx.config["FIELD"], "rom_field", "ROM_FIELD");

        prepareModule("FP");
        prepareModule("ECP");
        prepareModule("ECDH");

        if (ctx.config["@PF"] == 1   || ctx.config["@PF"] == 2) {
            prepareModule("FP2");
            prepareModule("FP4");
            prepareModule("FP12");
            prepareModule("ECP2");
            prepareModule("PAIR");
            prepareModule("MPIN");
			prepareModule("BLS");

        }

        if (ctx.config["@PF"] == 3) {
            prepareModule("FP2");
            prepareModule("FP4");
            prepareModule("FP8");
            prepareModule("FP24");
            prepareModule("ECP4");
            prepareModule("PAIR192");
            prepareModule("MPIN192");
            prepareModule("BLS192");
        }

        if (ctx.config["@PF"] == 4) {
            prepareModule("FP2");
            prepareModule("FP4");
            prepareModule("FP8");
            prepareModule("FP16");
            prepareModule("FP48");
            prepareModule("ECP8");
            prepareModule("PAIR256");
            prepareModule("MPIN256");
            prepareModule("BLS256");
        }

        return;
    }

};
