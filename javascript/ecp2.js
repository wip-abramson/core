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

/* CORE Weierstrass elliptic curve functions over ctx.FP2 */

var ECP2 = function(ctx) {
    "use strict";

    /* Constructor, set this=O */
    var ECP2 = function() {
        this.x = new ctx.FP2(0);
        this.y = new ctx.FP2(1);
        this.z = new ctx.FP2(0);
    };

    ECP2.prototype = {
        /* Test this=O? */
        is_infinity: function() {
            return (this.x.iszilch() && this.z.iszilch());
        },

        /* copy this=P */
        copy: function(P) {
            this.x.copy(P.x);
            this.y.copy(P.y);
            this.z.copy(P.z);
        },

        /* set this=O */
        inf: function() {
            this.x.zero();
            this.y.one();
            this.z.zero();
        },

        /* conditional move of Q to P dependant on d */
        cmove: function(Q, d) {
            this.x.cmove(Q.x, d);
            this.y.cmove(Q.y, d);
            this.z.cmove(Q.z, d);
        },

        /* Constant time select from pre-computed table */
        select: function(W, b) {
            var MP = new ECP2(),
                m, babs;

            m = b >> 31,
            babs = (b ^ m) - m;
            babs = (babs - 1) / 2;

            this.cmove(W[0], ECP2.teq(babs, 0)); // conditional move
            this.cmove(W[1], ECP2.teq(babs, 1));
            this.cmove(W[2], ECP2.teq(babs, 2));
            this.cmove(W[3], ECP2.teq(babs, 3));
            this.cmove(W[4], ECP2.teq(babs, 4));
            this.cmove(W[5], ECP2.teq(babs, 5));
            this.cmove(W[6], ECP2.teq(babs, 6));
            this.cmove(W[7], ECP2.teq(babs, 7));

            MP.copy(this);
            MP.neg();
            this.cmove(MP, (m & 1));
        },

        /* Test P == Q */
        equals: function(Q) {
            var a, b;

            a = new ctx.FP2(0);
            a.copy(this.x);
            b = new ctx.FP2(0);
            b.copy(Q.x);

            a.copy(this.x);
            a.mul(Q.z);
            a.reduce();
            b.copy(Q.x);
            b.mul(this.z);
            b.reduce();
            if (!a.equals(b)) {
                return false;
            }

            a.copy(this.y);
            a.mul(Q.z);
            a.reduce();
            b.copy(Q.y);
            b.mul(this.z);
            b.reduce();
            if (!a.equals(b)) {
                return false;
            }

            return true;
        },

        /* set this=-this */
        neg: function() {
            this.y.norm();
            this.y.neg();
            this.y.norm();
            return;
        },

        /* convert this to affine, from (x,y,z) to (x,y) */
        affine: function() {
            var one;

            if (this.is_infinity()) {
                return;
            }

            one = new ctx.FP2(1);

            if (this.z.equals(one)) {
                this.x.reduce();
                this.y.reduce();
                return;
            }

            this.z.inverse();

            this.x.mul(this.z);
            this.x.reduce();
            this.y.mul(this.z);
            this.y.reduce();
            this.z.copy(one);
        },

        /* extract affine x as ctx.FP2 */
        getX: function() {
			var W=new ECP2(); W.copy(this); W.affine();
            return W.x;
        },

        /* extract affine y as ctx.FP2 */
        getY: function() {
			var W=new ECP2(); W.copy(this); W.affine();
            return W.y;
        },

        /* extract projective x */
        getx: function() {
            return this.x;
        },

        /* extract projective y */
        gety: function() {
            return this.y;
        },

        /* extract projective z */
        getz: function() {
            return this.z;
        },

        /* convert this to byte array */
        toBytes: function(b,compress) {
            var t = [],
                i;
			var W=new ECP2(); W.copy(this);
            W.affine();

            W.x.getA().toBytes(t);
            for (i = 0; i < ctx.BIG.MODBYTES; i++) {
                b[i+1] = t[i];
            }
            W.x.getB().toBytes(t);
            for (i = 0; i < ctx.BIG.MODBYTES; i++) {
                b[i + ctx.BIG.MODBYTES+1] = t[i];
            }

            if (!compress)
            {
                b[0] = 0x04;
                W.y.getA().toBytes(t);
                for (i = 0; i < ctx.BIG.MODBYTES; i++) {
                    b[i + 2 * ctx.BIG.MODBYTES+1] = t[i];
                }
                W.y.getB().toBytes(t);
                for (i = 0; i < ctx.BIG.MODBYTES; i++) {
                    b[i + 3 * ctx.BIG.MODBYTES+1] = t[i];
                }
            } else {
                b[0]=0x02;
                if (W.y.sign() == 1)
                    b[0]=0x03;
            }            
        },

        /* convert this to hex string */
        toString: function() {
			var W=new ECP2(); W.copy(this);
            if (W.is_infinity()) {
                return "infinity";
            }
            W.affine();
            return "(" + W.x.toString() + "," + W.y.toString() + ")";
        },

        /* set this=(x,y) */
        setxy: function(ix, iy) {
            var rhs, y2;

            this.x.copy(ix);
            this.y.copy(iy);
            this.z.one();
			this.x.norm();

            rhs = ECP2.RHS(this.x);

            y2 = new ctx.FP2(this.y); 
            y2.sqr();

            if (!y2.equals(rhs)) {
                this.inf();
            }
        },

        /* set this=(x,.) */
        setx: function(ix,s) {
            var rhs;

            this.x.copy(ix);
            this.z.one();
			this.x.norm();

            rhs = ECP2.RHS(this.x);
//alert("Into setx= rhs= "+rhs.toString());
		    if (rhs.qr()==1) 
		    {
                rhs.sqrt();
                if (rhs.sign() != s)
                    rhs.neg();
                rhs.reduce();
			    this.y.copy(rhs);
            } else {
                this.inf();
            }
        },

        /* set this*=q, where q is Modulus, using Frobenius */
        frob: function(X) {
            var X2;

            X2 = new ctx.FP2(X); //X2.copy(X);
            X2.sqr();
            this.x.conj();
            this.y.conj();
            this.z.conj();
            this.z.reduce();
            this.x.mul(X2);
            this.y.mul(X2);
            this.y.mul(X);
        },

        /* this+=this */
        dbl: function() {
            var iy, t0, t1, t2, x3, y3;

            iy = new ctx.FP2(0);
            iy.copy(this.y); 
            if (ctx.ECP.SEXTIC_TWIST == ctx.ECP.D_TYPE) {
                iy.mul_ip();
                iy.norm();
            }

            t0 = new ctx.FP2(0);
            t0.copy(this.y); 
            t0.sqr();
            if (ctx.ECP.SEXTIC_TWIST == ctx.ECP.D_TYPE) {
                t0.mul_ip();
            }
            t1 = new ctx.FP2(0);
            t1.copy(iy); 
            t1.mul(this.z);
            t2 = new ctx.FP2(0);
            t2.copy(this.z);
            t2.sqr();

            this.z.copy(t0);
            this.z.add(t0);
            this.z.norm();
            this.z.add(this.z);
            this.z.add(this.z);
            this.z.norm();

            t2.imul(3 * ctx.ROM_CURVE.CURVE_B_I);
            if (ctx.ECP.SEXTIC_TWIST == ctx.ECP.M_TYPE) {
                t2.mul_ip();
                t2.norm();
            }

            x3 = new ctx.FP2(0);
            x3.copy(t2); 
            x3.mul(this.z);

            y3 = new ctx.FP2(0);
            y3.copy(t0); 

            y3.add(t2);
            y3.norm();
            this.z.mul(t1);
            t1.copy(t2);
            t1.add(t2);
            t2.add(t1);
            t2.norm();
            t0.sub(t2);
            t0.norm(); //y^2-9bz^2
            y3.mul(t0);
            y3.add(x3); //(y^2+3z*2)(y^2-9z^2)+3b.z^2.8y^2
            t1.copy(this.x);
            t1.mul(iy); //
            this.x.copy(t0);
            this.x.norm();
            this.x.mul(t1);
            this.x.add(this.x); //(y^2-9bz^2)xy2

            this.x.norm();
            this.y.copy(y3);
            this.y.norm();

            return 1;
        },

        /* this+=Q - return 0 for add, 1 for double, -1 for O */
        /* this+=Q */
        add: function(Q) {
            var b, t0, t1, t2, t3, t4, x3, y3, z3;

            b = 3 * ctx.ROM_CURVE.CURVE_B_I;
            t0 = new ctx.FP2(0);
            t0.copy(this.x); 
            t0.mul(Q.x); // x.Q.x
            t1 = new ctx.FP2(0);
            t1.copy(this.y); 
            t1.mul(Q.y); // y.Q.y

            t2 = new ctx.FP2(0);
            t2.copy(this.z); 
            t2.mul(Q.z);
            t3 = new ctx.FP2(0);
            t3.copy(this.x); 
            t3.add(this.y);
            t3.norm(); //t3=X1+Y1
            t4 = new ctx.FP2(0);
            t4.copy(Q.x); 
            t4.add(Q.y);
            t4.norm(); //t4=X2+Y2
            t3.mul(t4); //t3=(X1+Y1)(X2+Y2)
            t4.copy(t0);
            t4.add(t1); //t4=X1.X2+Y1.Y2

            t3.sub(t4);
            t3.norm();
            if (ctx.ECP.SEXTIC_TWIST == ctx.ECP.D_TYPE) {
                t3.mul_ip();
                t3.norm(); //t3=(X1+Y1)(X2+Y2)-(X1.X2+Y1.Y2) = X1.Y2+X2.Y1
            }

            t4.copy(this.y);
            t4.add(this.z);
            t4.norm(); //t4=Y1+Z1
            x3 = new ctx.FP2(0);
            x3.copy(Q.y); 
            x3.add(Q.z);
            x3.norm(); //x3=Y2+Z2

            t4.mul(x3); //t4=(Y1+Z1)(Y2+Z2)
            x3.copy(t1); //
            x3.add(t2); //X3=Y1.Y2+Z1.Z2

            t4.sub(x3);
            t4.norm();
            if (ctx.ECP.SEXTIC_TWIST == ctx.ECP.D_TYPE) {
                t4.mul_ip();
                t4.norm(); //t4=(Y1+Z1)(Y2+Z2) - (Y1.Y2+Z1.Z2) = Y1.Z2+Y2.Z1
            }

            x3.copy(this.x);
            x3.add(this.z);
            x3.norm(); // x3=X1+Z1
            y3 = new ctx.FP2(0);
            y3.copy(Q.x); 
            y3.add(Q.z);
            y3.norm(); // y3=X2+Z2
            x3.mul(y3); // x3=(X1+Z1)(X2+Z2)
            y3.copy(t0);
            y3.add(t2); // y3=X1.X2+Z1+Z2
            y3.rsub(x3);
            y3.norm(); // y3=(X1+Z1)(X2+Z2) - (X1.X2+Z1.Z2) = X1.Z2+X2.Z1

            if (ctx.ECP.SEXTIC_TWIST == ctx.ECP.D_TYPE) {
                t0.mul_ip();
                t0.norm(); // x.Q.x
                t1.mul_ip();
                t1.norm(); // y.Q.y
            }

            x3.copy(t0);
            x3.add(t0);
            t0.add(x3);
            t0.norm();
            t2.imul(b);
            if (ctx.ECP.SEXTIC_TWIST == ctx.ECP.M_TYPE) {
                t2.mul_ip(); t2.norm();
            }

            z3 = new ctx.FP2(0);
            z3.copy(t1); 
            z3.add(t2);
            z3.norm();
            t1.sub(t2);
            t1.norm();
            y3.imul(b);
            if (ctx.ECP.SEXTIC_TWIST == ctx.ECP.M_TYPE) {
                y3.mul_ip();
                y3.norm();
            }

            x3.copy(y3);
            x3.mul(t4);
            t2.copy(t3);
            t2.mul(t1);
            x3.rsub(t2);
            y3.mul(t0);
            t1.mul(z3);
            y3.add(t1);
            t0.mul(t3);
            z3.mul(t4);
            z3.add(t0);

            this.x.copy(x3);
            this.x.norm();
            this.y.copy(y3);
            this.y.norm();
            this.z.copy(z3);
            this.z.norm();

            return 0;
        },

        /* this-=Q */
        sub: function(Q) {
            var D;
			var NQ=new ECP2(); NQ.copy(Q);
            NQ.neg();
            D = this.add(NQ);
            return D;
        },

        /* P*=e */
        mul: function(e) {
            /* fixed size windows */
            var mt = new ctx.BIG(),
                t = new ctx.BIG(),
                C = new ECP2(),
                P = new ECP2(),
                Q = new ECP2(),
                W = [],
                w = [],
                i, nb, s, ns;

            if (this.is_infinity()) {
                return new ECP2();
            }

            // precompute table
            Q.copy(this);
            Q.dbl();
            W[0] = new ECP2();
            W[0].copy(this);

            for (i = 1; i < 8; i++) {
                W[i] = new ECP2();
                W[i].copy(W[i - 1]);
                W[i].add(Q);
            }

            // make exponent odd - add 2P if even, P if odd
            t.copy(e);
            s = t.parity();
            t.inc(1);
            t.norm();
            ns = t.parity();
            mt.copy(t);
            mt.inc(1);
            mt.norm();
            t.cmove(mt, s);
            Q.cmove(this, ns);
            C.copy(Q);

            nb = 1 + Math.floor((t.nbits() + 3) / 4);

            // convert exponent to signed 4-bit window
            for (i = 0; i < nb; i++) {
                w[i] = (t.lastbits(5) - 16);
                t.dec(w[i]);
                t.norm();
                t.fshr(4);
            }
            w[nb] = t.lastbits(5);

            P.copy(W[Math.floor((w[nb] - 1) / 2)]);
            for (i = nb - 1; i >= 0; i--) {
                Q.select(W, w[i]);
                P.dbl();
                P.dbl();
                P.dbl();
                P.dbl();
                P.add(Q);
            }
            P.sub(C);
            P.affine();

            return P;
        },

// clear cofactor
        cfp: function() {
            var fa = new ctx.BIG(0),
                fb = new ctx.BIG(0),
                q, x, T, K, X, xQ, x2Q;

        // Fast Hashing to G2 - Fuentes-Castaneda, Knapp and Rodriguez-Henriquez 
            fa.rcopy(ctx.ROM_FIELD.Fra);
            fb.rcopy(ctx.ROM_FIELD.Frb);
            X = new ctx.FP2(fa, fb);
            if (ctx.ECP.SEXTIC_TWIST == ctx.ECP.M_TYPE) {
                X.inverse();
                X.norm();
            }

            x = new ctx.BIG(0);
            x.rcopy(ctx.ROM_CURVE.CURVE_Bnx);

            if (ctx.ECP.CURVE_PAIRING_TYPE == ctx.ECP.BN) {
                T = new ECP2();
                T.copy(this);
                T = T.mul(x);
                if (ctx.ECP.SIGN_OF_X == ctx.ECP.NEGATIVEX) {
                    T.neg();
                }
                K = new ECP2();
                K.copy(T);
                K.dbl();
                K.add(T); //K.affine();

                K.frob(X);
                this.frob(X);
                this.frob(X);
                this.frob(X);
                this.add(T);
                this.add(K);
                T.frob(X);
                T.frob(X);
                this.add(T);
            }

            if (ctx.ECP.CURVE_PAIRING_TYPE == ctx.ECP.BLS) {

                xQ = this.mul(x);
                x2Q = xQ.mul(x);

                if (ctx.ECP.SIGN_OF_X == ctx.ECP.NEGATIVEX) {
                    xQ.neg();
                }

                x2Q.sub(xQ);
                x2Q.sub(this);

                xQ.sub(this);
                xQ.frob(X);

                this.dbl();
                this.frob(X);
                this.frob(X);

                this.add(x2Q);
                this.add(xQ);
            }

            this.affine();
        }

    };

    // set to group generator
    ECP2.generator = function() {
        var G=new ECP2(),
            A = new ctx.BIG(0),
            B = new ctx.BIG(0),
            QX, QY;

        A.rcopy(ctx.ROM_CURVE.CURVE_Pxa);
        B.rcopy(ctx.ROM_CURVE.CURVE_Pxb);
        QX = new ctx.FP2(0);
        QX.bset(A, B);
        A.rcopy(ctx.ROM_CURVE.CURVE_Pya);
        B.rcopy(ctx.ROM_CURVE.CURVE_Pyb);
        QY = new ctx.FP2(0);
        QY.bset(A, B);
        G.setxy(QX, QY);
        return G;
    };

    /* convert from byte array to point */
    ECP2.fromBytes = function(b) {
        var t = [],
            ra, rb, i, rx, ry, P;

        var typ= b[0];
        P = new ECP2();

        for (i = 0; i < ctx.BIG.MODBYTES; i++) {
            t[i] = b[i+1];
        }
        ra = ctx.BIG.fromBytes(t);
        for (i = 0; i < ctx.BIG.MODBYTES; i++) {
            t[i] = b[i + ctx.BIG.MODBYTES+1];
        }
        rb = ctx.BIG.fromBytes(t);

        rx = new ctx.FP2(ra, rb); //rx.bset(ra,rb);
        if (typ == 0x04)
        {
            for (i = 0; i < ctx.BIG.MODBYTES; i++) {
                t[i] = b[i + 2 * ctx.BIG.MODBYTES+1];
            }
            ra = ctx.BIG.fromBytes(t);
            for (i = 0; i < ctx.BIG.MODBYTES; i++) {
                t[i] = b[i + 3 * ctx.BIG.MODBYTES+1];
            }
            rb = ctx.BIG.fromBytes(t);

            ry = new ctx.FP2(ra, rb); //ry.bset(ra,rb);
            P.setxy(rx, ry);
        } else {
            P.setx(rx,typ&1);
        }   
        return P;
    };

    /* Calculate RHS of curve equation x^3+B */
    ECP2.RHS = function(x) {
        var r, c, b;

        //x.norm();
        r = new ctx.FP2(x); //r.copy(x);
        r.sqr();

        c = new ctx.BIG(0);
        c.rcopy(ctx.ROM_CURVE.CURVE_B);
        b = new ctx.FP2(c); //b.bseta(c);

        if (ctx.ECP.SEXTIC_TWIST == ctx.ECP.D_TYPE) {
            b.div_ip();
        }
        if (ctx.ECP.SEXTIC_TWIST == ctx.ECP.M_TYPE) {
            b.norm();
            b.mul_ip();
            b.norm();
        }

        r.mul(x);
        r.add(b);

        r.reduce();

        return r;
    };

    /* P=u0.Q0+u1*Q1+u2*Q2+u3*Q3 */
    // Bos & Costello https://eprint.iacr.org/2013/458.pdf
    // Faz-Hernandez & Longa & Sanchez  https://eprint.iacr.org/2013/158.pdf
    // Side channel attack secure
    ECP2.mul4 = function(Q, u) {
        var W = new ECP2(),
            P = new ECP2(),
            T = [],
            mt = new ctx.BIG(),
            t = [],
            w = [],
            s = [],
            i, j, k, nb, bt, pb;

        for (i = 0; i < 4; i++) {
            t[i] = new ctx.BIG(u[i]); t[i].norm();
            //Q[i].affine();
        }

        T[0] = new ECP2(); T[0].copy(Q[0]); // Q[0]
        T[1] = new ECP2(); T[1].copy(T[0]); T[1].add(Q[1]); // Q[0]+Q[1]
        T[2] = new ECP2(); T[2].copy(T[0]); T[2].add(Q[2]); // Q[0]+Q[2]
        T[3] = new ECP2(); T[3].copy(T[1]); T[3].add(Q[2]); // Q[0]+Q[1]+Q[2]
        T[4] = new ECP2(); T[4].copy(T[0]); T[4].add(Q[3]); // Q[0]+Q[3]
        T[5] = new ECP2(); T[5].copy(T[1]); T[5].add(Q[3]); // Q[0]+Q[1]+Q[3]
        T[6] = new ECP2(); T[6].copy(T[2]); T[6].add(Q[3]); // Q[0]+Q[2]+Q[3]
        T[7] = new ECP2(); T[7].copy(T[3]); T[7].add(Q[3]); // Q[0]+Q[1]+Q[2]+Q[3]

        // Make it odd
        pb=1-t[0].parity();
        t[0].inc(pb);
        t[0].norm();

        // Number of bits
        mt.zero();
        for (i=0;i<4;i++) {
            mt.or(t[i]);
        }

        nb=1+mt.nbits();

        // Sign pivot
        s[nb-1]=1;
        for (i=0;i<nb-1;i++) {
            t[0].fshr(1);
            s[i]=2*t[0].parity()-1;
        }

        // Recoded exponent
        for (i=0; i<nb; i++) {
            w[i]=0;
            k=1;
            for (j=1; j<4; j++) {
                bt=s[i]*t[j].parity();
                t[j].fshr(1);
                t[j].dec(bt>>1);
                t[j].norm();
                w[i]+=bt*k;
                k*=2;
            }
        }

        // Main loop
        P.select(T,2*w[nb-1]+1);
        for (i=nb-2;i>=0;i--) {
            P.dbl();
            W.select(T,2*w[i]+s[i]);
            P.add(W);
        }

        // apply correction
        W.copy(P);
        W.sub(Q[0]);
        P.cmove(W,pb);
        P.affine();
        return P;
    };


    /* return 1 if b==c, no branching */
    ECP2.teq = function(b, c) {
        var x = b ^ c;
        x -= 1; // if x=0, x now -1
        return ((x >> 31) & 1);
    };

/* Deterministic mapping of Fp to point on curve */
    ECP2.hashit = function(h)
    { // SWU method
        var sgn,ne;
        var W=new ctx.FP2(1);

        var c = new ctx.BIG(0);
        c.rcopy(ctx.ROM_CURVE.CURVE_B);
        var B = new ctx.FP2(c);

        var t=new ctx.FP(h);
        var s=new ctx.FP(-3);
        var one=new ctx.FP(1);

		if (ctx.ECP.SEXTIC_TWIST == ctx.ECP.D_TYPE) B.div_ip();
		if (ctx.ECP.SEXTIC_TWIST == ctx.ECP.M_TYPE) B.mul_ip();
        B.norm();
        sgn=t.sign();
        var w=s.sqrt(null);
        var j=new ctx.FP(w); j.sub(one); j.norm(); j.div2();

        w.mul(t);
        var b=new ctx.FP(t);
        b.sqr();
        b.add(one);
        var Y=new ctx.FP2(b);
        B.add(Y); B.norm(); B.inverse();
        B.pmul(w);

        var X1=new ctx.FP2(B); X1.pmul(t);
        Y.copy(new ctx.FP2(j));
        var X2=new ctx.FP2(X1); X2.sub(Y); X2.norm();
        X1.copy(X2); X1.neg(); X1.norm();
        X2.sub(W); X2.norm();

        B.sqr(); B.inverse();
        var X3=new ctx.FP2(B); X3.add(W); X3.norm();

        Y.copy(ECP2.RHS(X2));
        X1.cmove(X2,Y.qr());
        Y.copy(ECP2.RHS(X3));
        X1.cmove(X3,Y.qr());
        Y.copy(ECP2.RHS(X1));
        Y.sqrt();

        ne=Y.sign()^sgn;
        W.copy(Y); W.neg(); W.norm();
        Y.cmove(W,ne);

        var P=new ECP2();
        P.setxy(X1,Y);
        return P;
    };

/* Map octet string to curve point */
	ECP2.mapit = function(h)
	{
		var q=new ctx.BIG(0);
        q.rcopy(ctx.ROM_FIELD.Modulus);
		var dx=ctx.DBIG.fromBytes(h);
        var x=dx.mod(q);
		
		var Q=ECP2.hashit(x);
		Q.cfp();
        return Q;
    };

    return ECP2;
};
