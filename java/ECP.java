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

/* Elliptic Curve Point class */

package org.miracl.core.XXX;

public final class ECP {

	private FP x;
	private FP y;
	private FP z;

/* Constructor - set to O */
	public ECP() {
		x=new FP();
		y=new FP(1);
		if (CONFIG_CURVE.CURVETYPE==CONFIG_CURVE.EDWARDS)
		{
			z=new FP(1);
		}
		else
		{
			z=new FP();
		}
	}

    public ECP(ECP e) {
        this.x = new FP(e.x);
        this.y = new FP(e.y);
        this.z = new FP(e.z);
    }

/* test for O point-at-infinity */
	public boolean is_infinity() {
//		if (INF) return true;                            // Edits made
		if (CONFIG_CURVE.CURVETYPE==CONFIG_CURVE.EDWARDS)
		{
			return (x.iszilch() && y.equals(z));
		}
		if (CONFIG_CURVE.CURVETYPE==CONFIG_CURVE.WEIERSTRASS)
		{
			return (x.iszilch() && z.iszilch());
		}
		if (CONFIG_CURVE.CURVETYPE==CONFIG_CURVE.MONTGOMERY)
		{
			return z.iszilch();
		}
		return true;
	}
/* Conditional swap of P and Q dependant on d */
	private void cswap(ECP Q,int d)
	{
		x.cswap(Q.x,d);
		if (CONFIG_CURVE.CURVETYPE!=CONFIG_CURVE.MONTGOMERY) y.cswap(Q.y,d);
		z.cswap(Q.z,d);
	}

/* Conditional move of Q to P dependant on d */
	private void cmove(ECP Q,int d)
	{
		x.cmove(Q.x,d);
		if (CONFIG_CURVE.CURVETYPE!=CONFIG_CURVE.MONTGOMERY) y.cmove(Q.y,d);
		z.cmove(Q.z,d);
	}

/* return 1 if b==c, no branching */
	private static int teq(int b,int c)
	{
		int x=b^c;
		x-=1;  // if x=0, x now -1
		return ((x>>31)&1);
	}

/* Constant time select from pre-computed table */
	private void select(ECP W[],int b)
	{
		ECP MP=new ECP(); 
		int m=b>>31;
		int babs=(b^m)-m;

		babs=(babs-1)/2;
		cmove(W[0],teq(babs,0));  // conditional move
		cmove(W[1],teq(babs,1));
		cmove(W[2],teq(babs,2));
		cmove(W[3],teq(babs,3));
		cmove(W[4],teq(babs,4));
		cmove(W[5],teq(babs,5));
		cmove(W[6],teq(babs,6));
		cmove(W[7],teq(babs,7));
 
		MP.copy(this);
		MP.neg();
		cmove(MP,(int)(m&1));
	}

/* Test P == Q */
	public boolean equals(ECP Q) {

		FP a=new FP();                                        // Edits made
		FP b=new FP();
		a.copy(x); a.mul(Q.z); 
		b.copy(Q.x); b.mul(z); 
		if (!a.equals(b)) return false;
		if (CONFIG_CURVE.CURVETYPE!=CONFIG_CURVE.MONTGOMERY)
		{
			a.copy(y); a.mul(Q.z); 
			b.copy(Q.y); b.mul(z); 
			if (!a.equals(b)) return false;
		}
		return true;
	}

/* this=P */
	public void copy(ECP P)
	{
		x.copy(P.x);
		if (CONFIG_CURVE.CURVETYPE!=CONFIG_CURVE.MONTGOMERY) y.copy(P.y);
		z.copy(P.z);
	}
/* this=-this */
	public void neg() {
		if (CONFIG_CURVE.CURVETYPE==CONFIG_CURVE.WEIERSTRASS)
		{
			y.neg(); y.norm();
		}
		if (CONFIG_CURVE.CURVETYPE==CONFIG_CURVE.EDWARDS)
		{
			x.neg(); x.norm();
		}
		return;
	}
/* set this=O */
	public void inf() {
//		INF=true;
		x.zero();
		if (CONFIG_CURVE.CURVETYPE!=CONFIG_CURVE.MONTGOMERY) y.one();
		if (CONFIG_CURVE.CURVETYPE!=CONFIG_CURVE.EDWARDS) z.zero();
		else z.one();
	}

/* Calculate RHS of curve equation */
	public static FP RHS(FP x) {
		FP r=new FP(x);
		r.sqr();

		if (CONFIG_CURVE.CURVETYPE==CONFIG_CURVE.WEIERSTRASS)
		{ // x^3+Ax+B
			FP b=new FP(new BIG(ROM.CURVE_B));
			r.mul(x);
			if (ROM.CURVE_A==-3)
			{
				FP cx=new FP(x);
				cx.imul(3);
				cx.neg(); cx.norm();
				r.add(cx);
			}
			r.add(b);
		}
		if (CONFIG_CURVE.CURVETYPE==CONFIG_CURVE.EDWARDS)
		{ // (Ax^2-1)/(Bx^2-1) 
			FP b=new FP(new BIG(ROM.CURVE_B));

			FP one=new FP(1);
			b.mul(r);
			b.sub(one);
			b.norm();
			if (ROM.CURVE_A==-1) r.neg();
			r.sub(one); r.norm();
			b.inverse();

			r.mul(b);
		}
		if (CONFIG_CURVE.CURVETYPE==CONFIG_CURVE.MONTGOMERY)
		{ // x^3+Ax^2+x
			FP x3=new FP();
			x3.copy(r);
			x3.mul(x);
			r.imul(ROM.CURVE_A);
			r.add(x3);
			r.add(x);
		}
		r.reduce();
		return r;
	}

/* set (x,y) from two BIGs */
	public ECP(BIG ix,BIG iy) {
		x=new FP(ix);
		y=new FP(iy);
		z=new FP(1);
		x.norm();
		FP rhs=RHS(x);

		if (CONFIG_CURVE.CURVETYPE==CONFIG_CURVE.MONTGOMERY)
		{
			if (rhs.qr(null)!=1) inf();
		}
		else
		{
			FP y2=new FP(y);
			y2.sqr();
			if (!y2.equals(rhs)) inf();
		}
	}
/* set (x,y) from BIG and a bit */
	public ECP(BIG ix,int s) {
		x=new FP(ix);
		x.norm();
		FP rhs=RHS(x);
        FP hint=new FP();
		y=new FP();
		z=new FP(1);
		if (rhs.qr(hint)==1)
		{
			FP ny=rhs.sqrt(hint);
			if (ny.redc().parity()!=s) ny.neg();
			y.copy(ny);
		}
		else inf();
	}

/* set from x - calculate y from curve equation */
	public ECP(BIG ix) {
		x=new FP(ix);
		x.norm();
		FP rhs=RHS(x);
        FP hint=new FP();
		y=new FP();
		z=new FP(1);
		if (rhs.qr(hint)==1)
		{
			if (CONFIG_CURVE.CURVETYPE!=CONFIG_CURVE.MONTGOMERY) y.copy(rhs.sqrt(hint));
		}
		else inf(); //INF=true;
	}

/* set to affine - from (x,y,z) to (x,y) */
	public void affine() {
		if (is_infinity()) return;	// 
		FP one=new FP(1);
		if (z.equals(one)) return;
		z.inverse();
		x.mul(z); x.reduce();
		if (CONFIG_CURVE.CURVETYPE!=CONFIG_CURVE.MONTGOMERY)            // Edits made
		{
			y.mul(z); y.reduce();
		}
		z.copy(one);
	}
/* extract x as a BIG */
	public BIG getX()
	{
		ECP W=new ECP(this);
		W.affine();
		return W.x.redc();
	}
/* extract y as a BIG */
	public BIG getY()
	{
		ECP W=new ECP(this);
		W.affine();
		return W.y.redc();
	}

/* get sign of Y */
	public int getS()
	{
		BIG y=getY();
		return y.parity();
	}
/* extract x as an FP */
	public FP getx()
	{
		return x;
	}
/* extract y as an FP */
	public FP gety()
	{
		return y;
	}
/* extract z as an FP */
	public FP getz()
	{
		return z;
	}
/* convert to byte array */
	public void toBytes(byte[] b,boolean compress)
	{
		byte[] t=new byte[CONFIG_BIG.MODBYTES];
		ECP W=new ECP(this);
		W.affine();

		W.x.redc().toBytes(t);

		if (CONFIG_CURVE.CURVETYPE==CONFIG_CURVE.MONTGOMERY)
		{
		    for (int i=0;i<CONFIG_BIG.MODBYTES;i++) b[i]=t[i];
			//b[0]=0x06;
			return;
		}
		for (int i=0;i<CONFIG_BIG.MODBYTES;i++) b[i+1]=t[i];
		if (compress)
		{
			b[0]=0x02;
			if (y.redc().parity()==1) b[0]=0x03;
			return;
		}

		b[0]=0x04;

		W.y.redc().toBytes(t);
		for (int i=0;i<CONFIG_BIG.MODBYTES;i++) b[i+CONFIG_BIG.MODBYTES+1]=t[i];
	}
/* convert from byte array to point */
	public static ECP fromBytes(byte[] b)
	{
		byte[] t=new byte[CONFIG_BIG.MODBYTES];
		BIG p=new BIG(ROM.Modulus);


		if (CONFIG_CURVE.CURVETYPE==CONFIG_CURVE.MONTGOMERY)
		{
		    for (int i=0;i<CONFIG_BIG.MODBYTES;i++) t[i]=b[i];
		    BIG px=BIG.fromBytes(t);
		    if (BIG.comp(px,p)>=0) return new ECP();

			return new ECP(px);
		}

		for (int i=0;i<CONFIG_BIG.MODBYTES;i++) t[i]=b[i+1];
		BIG px=BIG.fromBytes(t);
		if (BIG.comp(px,p)>=0) return new ECP();

		if (b[0]==0x04)
		{
			for (int i=0;i<CONFIG_BIG.MODBYTES;i++) t[i]=b[i+CONFIG_BIG.MODBYTES+1];
			BIG py=BIG.fromBytes(t);
			if (BIG.comp(py,p)>=0) return new ECP();
			return new ECP(px,py);
		}

		if (b[0]==0x02 || b[0]==0x03)
		{
			return new ECP(px,(int)(b[0]&1));
		}
		return new ECP();
	}
/* convert to hex string */
	public String toString() {
		ECP W=new ECP(this);	
		W.affine();
		if (W.is_infinity()) return "infinity";
		if (CONFIG_CURVE.CURVETYPE==CONFIG_CURVE.MONTGOMERY) return "("+W.x.redc().toString()+")";
		else return "("+W.x.redc().toString()+","+W.y.redc().toString()+")";
	}

/* convert to hex string */
	public String toRawString() {
		ECP W=new ECP(this);	
		if (CONFIG_CURVE.CURVETYPE==CONFIG_CURVE.MONTGOMERY) return "("+W.x.redc().toString()+","+W.z.redc().toString()+")";
		else return "("+W.x.redc().toString()+","+W.y.redc().toString()+","+W.z.redc().toString()+")";
	}

/* this*=2 */
	public void dbl() {
		
		if (CONFIG_CURVE.CURVETYPE==CONFIG_CURVE.WEIERSTRASS)
		{
			if (ROM.CURVE_A==0)
			{
				FP t0=new FP(y);                      /*** Change ***/    // Edits made
				t0.sqr();
				FP t1=new FP(y);
				t1.mul(z);
				FP t2=new FP(z);
				t2.sqr();

				z.copy(t0);
				z.add(t0); z.norm(); 
				z.add(z); z.add(z); z.norm();
				t2.imul(3*ROM.CURVE_B_I);

				FP x3=new FP(t2);
				x3.mul(z);

				FP y3=new FP(t0);
				y3.add(t2); y3.norm();
				z.mul(t1); 
				t1.copy(t2); t1.add(t2); t2.add(t1);
				t0.sub(t2); t0.norm(); y3.mul(t0); y3.add(x3);
				t1.copy(x); t1.mul(y); 
				x.copy(t0); x.norm(); x.mul(t1); x.add(x);
				x.norm(); 
				y.copy(y3); y.norm();
			}
			else
			{
				FP t0=new FP(x);
				FP t1=new FP(y);
				FP t2=new FP(z);
				FP t3=new FP(x);
				FP z3=new FP(z);
				FP y3=new FP();
				FP x3=new FP();
				FP b=new FP();

				if (ROM.CURVE_B_I==0)
					b.copy(new FP(new BIG(ROM.CURVE_B)));

				t0.sqr();  //1    x^2
				t1.sqr();  //2    y^2
				t2.sqr();  //3

				t3.mul(y); //4
				t3.add(t3); t3.norm();//5
				z3.mul(x);   //6
				z3.add(z3);  z3.norm();//7
				y3.copy(t2); 
				
				if (ROM.CURVE_B_I==0)
					y3.mul(b); //8
				else
					y3.imul(ROM.CURVE_B_I);
				
				y3.sub(z3); //y3.norm(); //9  ***
				x3.copy(y3); x3.add(y3); x3.norm();//10

				y3.add(x3); //y3.norm();//11
				x3.copy(t1); x3.sub(y3); x3.norm();//12
				y3.add(t1); y3.norm();//13
				y3.mul(x3); //14
				x3.mul(t3); //15
				t3.copy(t2); t3.add(t2); //t3.norm(); //16
				t2.add(t3); //t2.norm(); //17

				if (ROM.CURVE_B_I==0)
					z3.mul(b); //18
				else
					z3.imul(ROM.CURVE_B_I);

				z3.sub(t2); //z3.norm();//19
				z3.sub(t0); z3.norm();//20  ***
				t3.copy(z3); t3.add(z3); //t3.norm();//21

				z3.add(t3); z3.norm(); //22
				t3.copy(t0); t3.add(t0); //t3.norm(); //23
				t0.add(t3); //t0.norm();//24
				t0.sub(t2); t0.norm();//25

				t0.mul(z3);//26
				y3.add(t0); //y3.norm();//27
				t0.copy(y); t0.mul(z);//28
				t0.add(t0); t0.norm(); //29
				z3.mul(t0);//30
				x3.sub(z3); //x3.norm();//31
				t0.add(t0); t0.norm();//32
				t1.add(t1); t1.norm();//33
				z3.copy(t0); z3.mul(t1);//34

				x.copy(x3); x.norm(); 
				y.copy(y3); y.norm();
				z.copy(z3); z.norm();
			}
		}
		if (CONFIG_CURVE.CURVETYPE==CONFIG_CURVE.EDWARDS)
		{
			FP C=new FP(x);
			FP D=new FP(y);
			FP H=new FP(z);
			FP J=new FP();

			x.mul(y); x.add(x); x.norm();
			C.sqr();
			D.sqr();

			if (ROM.CURVE_A==-1) C.neg();	

			y.copy(C); y.add(D); y.norm();
			H.sqr(); H.add(H);

			z.copy(y);
			J.copy(y); 

			J.sub(H); J.norm();
			x.mul(J);

			C.sub(D); C.norm();
			y.mul(C);
			z.mul(J);
		}
		if (CONFIG_CURVE.CURVETYPE==CONFIG_CURVE.MONTGOMERY)
		{
			FP A=new FP(x);
			FP B=new FP(x);		
			FP AA=new FP();
			FP BB=new FP();
			FP C=new FP();

			A.add(z); A.norm();
			AA.copy(A); AA.sqr();
			B.sub(z); B.norm();
			BB.copy(B); BB.sqr();
			C.copy(AA); C.sub(BB); C.norm();
			x.copy(AA); x.mul(BB);

			A.copy(C); A.imul((ROM.CURVE_A+2)/4);

			BB.add(A); BB.norm();
			z.copy(BB); z.mul(C);
		}
		return;
	}

/* this+=Q */
	public void add(ECP Q) {

		if (CONFIG_CURVE.CURVETYPE==CONFIG_CURVE.WEIERSTRASS)
		{
			if (ROM.CURVE_A==0)
			{
				int b=3*ROM.CURVE_B_I;
				FP t0=new FP(x);
				t0.mul(Q.x);
				FP t1=new FP(y);
				t1.mul(Q.y);
				FP t2=new FP(z);
				t2.mul(Q.z);
				FP t3=new FP(x);
				t3.add(y); t3.norm();
				FP t4=new FP(Q.x);
				t4.add(Q.y); t4.norm();
				t3.mul(t4);
				t4.copy(t0); t4.add(t1);

				t3.sub(t4); t3.norm();
				t4.copy(y);
				t4.add(z); t4.norm();
				FP x3=new FP(Q.y);
				x3.add(Q.z); x3.norm();

				t4.mul(x3);
				x3.copy(t1);
				x3.add(t2);
	
				t4.sub(x3); t4.norm();
				x3.copy(x); x3.add(z); x3.norm();
				FP y3=new FP(Q.x);
				y3.add(Q.z); y3.norm();
				x3.mul(y3);
				y3.copy(t0);
				y3.add(t2);
				y3.rsub(x3); y3.norm();
				x3.copy(t0); x3.add(t0); 
				t0.add(x3); t0.norm();
				t2.imul(b);

				FP z3=new FP(t1); z3.add(t2); z3.norm();
				t1.sub(t2); t1.norm(); 
				y3.imul(b);
	
				x3.copy(y3); x3.mul(t4); t2.copy(t3); t2.mul(t1); x3.rsub(t2);
				y3.mul(t0); t1.mul(z3); y3.add(t1);
				t0.mul(t3); z3.mul(t4); z3.add(t0);

				x.copy(x3); x.norm(); 
				y.copy(y3); y.norm();
				z.copy(z3); z.norm();
			}
			else
			{
				FP t0=new FP(x);
				FP t1=new FP(y);
				FP t2=new FP(z);
				FP t3=new FP(x);
				FP t4=new FP(Q.x);
				FP z3=new FP();
				FP y3=new FP(Q.x);
				FP x3=new FP(Q.y);
				FP b=new FP();

				if (ROM.CURVE_B_I==0)
					b.copy(new FP(new BIG(ROM.CURVE_B)));

				t0.mul(Q.x); //1
				t1.mul(Q.y); //2
				t2.mul(Q.z); //3

				t3.add(y); t3.norm(); //4
				t4.add(Q.y); t4.norm();//5
				t3.mul(t4);//6
				t4.copy(t0); t4.add(t1); //t4.norm(); //7
				t3.sub(t4); t3.norm(); //8
				t4.copy(y); t4.add(z); t4.norm();//9
				x3.add(Q.z); x3.norm();//10
				t4.mul(x3); //11
				x3.copy(t1); x3.add(t2); //x3.norm();//12

				t4.sub(x3); t4.norm();//13
				x3.copy(x); x3.add(z); x3.norm(); //14
				y3.add(Q.z); y3.norm();//15

				x3.mul(y3); //16
				y3.copy(t0); y3.add(t2); //y3.norm();//17

				y3.rsub(x3); y3.norm(); //18
				z3.copy(t2); 
				

				if (ROM.CURVE_B_I==0)
					z3.mul(b); //18
				else
					z3.imul(ROM.CURVE_B_I);
				
				x3.copy(y3); x3.sub(z3); x3.norm(); //20
				z3.copy(x3); z3.add(x3); //z3.norm(); //21

				x3.add(z3); //x3.norm(); //22
				z3.copy(t1); z3.sub(x3); z3.norm(); //23
				x3.add(t1); x3.norm(); //24

				if (ROM.CURVE_B_I==0)
					y3.mul(b); //18
				else
					y3.imul(ROM.CURVE_B_I);

				t1.copy(t2); t1.add(t2); //t1.norm();//26
				t2.add(t1); //t2.norm();//27

				y3.sub(t2); //y3.norm(); //28

				y3.sub(t0); y3.norm(); //29
				t1.copy(y3); t1.add(y3); //t1.norm();//30
				y3.add(t1); y3.norm(); //31

				t1.copy(t0); t1.add(t0); //t1.norm(); //32
				t0.add(t1); //t0.norm();//33
				t0.sub(t2); t0.norm();//34
				t1.copy(t4); t1.mul(y3);//35
				t2.copy(t0); t2.mul(y3);//36
				y3.copy(x3); y3.mul(z3);//37
				y3.add(t2); //y3.norm();//38
				x3.mul(t3);//39
				x3.sub(t1);//40
				z3.mul(t4);//41
				t1.copy(t3); t1.mul(t0);//42
				z3.add(t1); 
				x.copy(x3); x.norm(); 
				y.copy(y3); y.norm();
				z.copy(z3); z.norm();
			}
		}
		if (CONFIG_CURVE.CURVETYPE==CONFIG_CURVE.EDWARDS)
		{
			FP A=new FP(z);
			FP B=new FP();
			FP C=new FP(x);
			FP D=new FP(y);
			FP E=new FP();
			FP F=new FP();
			FP G=new FP();

			A.mul(Q.z);   
			B.copy(A); B.sqr();    
			C.mul(Q.x);      
			D.mul(Q.y); 

			E.copy(C); E.mul(D);  
		
			if (ROM.CURVE_B_I==0)
			{
				FP b=new FP(new BIG(ROM.CURVE_B));
				E.mul(b);
			}
			else
				E.imul(ROM.CURVE_B_I); 

			F.copy(B); F.sub(E);      
			G.copy(B); G.add(E);       

			if (ROM.CURVE_A==1)
			{
				E.copy(D); E.sub(C);
			}
			C.add(D); 

			B.copy(x); B.add(y);    
			D.copy(Q.x); D.add(Q.y); B.norm(); D.norm(); 
			B.mul(D);                   
			B.sub(C); B.norm(); F.norm(); 
			B.mul(F);                     
			x.copy(A); x.mul(B); G.norm();  
			if (ROM.CURVE_A==1)
			{
				E.norm(); C.copy(E); C.mul(G);  
			}
			if (ROM.CURVE_A==-1)
			{
				C.norm(); C.mul(G);
			}
			y.copy(A); y.mul(C);     

			z.copy(F);	
			z.mul(G);
		}
		return;
	}

/* Differential Add for CONFIG_CURVE.MONTGOMERY curves. this+=Q where W is this-Q and is affine. */
	public void dadd(ECP Q,ECP W) {
		FP A=new FP(x);
		FP B=new FP(x);
		FP C=new FP(Q.x);
		FP D=new FP(Q.x);
		FP DA=new FP();
		FP CB=new FP();	
			
		A.add(z); 
		B.sub(z); 

		C.add(Q.z);
		D.sub(Q.z);
		A.norm();

		D.norm();
		DA.copy(D); DA.mul(A);

		C.norm();
		B.norm();
		CB.copy(C); CB.mul(B);

		A.copy(DA); A.add(CB); 
		A.norm(); A.sqr();
		B.copy(DA); B.sub(CB); 
		B.norm(); B.sqr();

		x.copy(A);
		z.copy(W.x); z.mul(B);
	}
/* this-=Q */
	public void sub(ECP Q) {
		ECP NQ=new ECP(Q);
		NQ.neg();
		add(NQ);
	}

/* constant time multiply by small integer of length bts - use ladder */
	public ECP pinmul(int e,int bts) {	
		if (CONFIG_CURVE.CURVETYPE==CONFIG_CURVE.MONTGOMERY)
			return this.mul(new BIG(e));
		else
		{
			int nb,i,b;
			ECP P=new ECP();
			ECP R0=new ECP();
			ECP R1=new ECP(); R1.copy(this);

			for (i=bts-1;i>=0;i--)
			{
				b=(e>>i)&1;
				P.copy(R1);
				P.add(R0);
				R0.cswap(R1,b);
				R1.copy(P);
				R0.dbl();
				R0.cswap(R1,b);
			}
			P.copy(R0);
			P.affine();
			return P;
		}
	}

/* return e.this */

	public ECP mul(BIG e) {
		if (e.iszilch() || is_infinity()) return new ECP();
		ECP P=new ECP();
		if (CONFIG_CURVE.CURVETYPE==CONFIG_CURVE.MONTGOMERY)
		{
/* use Ladder */
			int nb,i,b;
			ECP D=new ECP();
			ECP R0=new ECP(); R0.copy(this);
			ECP R1=new ECP(); R1.copy(this);
			R1.dbl();

			D.copy(this); D.affine();
			nb=e.nbits();
			for (i=nb-2;i>=0;i--)
			{
				b=e.bit(i);
				P.copy(R1);

				P.dadd(R0,D);
				R0.cswap(R1,b);
				R1.copy(P);
				R0.dbl();
				R0.cswap(R1,b);

			}

			P.copy(R0);
		}
		else
		{
// fixed size windows 
			int i,b,nb,m,s,ns;
			BIG mt=new BIG();
			BIG t=new BIG();
			ECP Q=new ECP();
			ECP C=new ECP();
			ECP[] W=new ECP[8];
			byte[] w=new byte[1+(BIG.NLEN*CONFIG_BIG.BASEBITS+3)/4];

// precompute table 
			Q.copy(this);

			Q.dbl();
			W[0]=new ECP();
			W[0].copy(this);

			for (i=1;i<8;i++)
			{
				W[i]=new ECP();
				W[i].copy(W[i-1]);
				W[i].add(Q);
			}

// make exponent odd - add 2P if even, P if odd 
			t.copy(e);
			s=t.parity();
			t.inc(1); t.norm(); ns=t.parity(); mt.copy(t); mt.inc(1); mt.norm();
			t.cmove(mt,s);
			Q.cmove(this,ns);
			C.copy(Q);

			nb=1+(t.nbits()+3)/4;

// convert exponent to signed 4-bit window 
			for (i=0;i<nb;i++)
			{
				w[i]=(byte)(t.lastbits(5)-16);
				t.dec(w[i]); t.norm();
				t.fshr(4);	
			}
			w[nb]=(byte)t.lastbits(5);
	
			P.copy(W[(w[nb]-1)/2]);  
			for (i=nb-1;i>=0;i--)
			{
				Q.select(W,w[i]);
				P.dbl();
				P.dbl();
				P.dbl();
				P.dbl();
				P.add(Q);
			}
			P.sub(C); /* apply correction */
		}
		P.affine();
		return P;
	}

/* Return e.this+f.Q */

	public ECP mul2(BIG e,ECP Q,BIG f) {
		BIG te=new BIG();
		BIG tf=new BIG();
		BIG mt=new BIG();
		ECP S=new ECP();
		ECP T=new ECP();
		ECP C=new ECP();
		ECP[] W=new ECP[8];
		byte[] w=new byte[1+(BIG.NLEN*CONFIG_BIG.BASEBITS+1)/2];		
		int i,s,ns,nb;
		byte a,b;

		te.copy(e);
		tf.copy(f);

// precompute table 
		W[1]=new ECP(); W[1].copy(this); W[1].sub(Q);
		W[2]=new ECP(); W[2].copy(this); W[2].add(Q);
		S.copy(Q); S.dbl();
		W[0]=new ECP(); W[0].copy(W[1]); W[0].sub(S);
		W[3]=new ECP(); W[3].copy(W[2]); W[3].add(S);
		T.copy(this); T.dbl();
		W[5]=new ECP(); W[5].copy(W[1]); W[5].add(T);
		W[6]=new ECP(); W[6].copy(W[2]); W[6].add(T);
		W[4]=new ECP(); W[4].copy(W[5]); W[4].sub(S);
		W[7]=new ECP(); W[7].copy(W[6]); W[7].add(S);

// if multiplier is odd, add 2, else add 1 to multiplier, and add 2P or P to correction 

		s=te.parity();
		te.inc(1); te.norm(); ns=te.parity(); mt.copy(te); mt.inc(1); mt.norm();
		te.cmove(mt,s);
		T.cmove(this,ns);
		C.copy(T);

		s=tf.parity();
		tf.inc(1); tf.norm(); ns=tf.parity(); mt.copy(tf); mt.inc(1); mt.norm();
		tf.cmove(mt,s);
		S.cmove(Q,ns);
		C.add(S);

		mt.copy(te); mt.add(tf); mt.norm();
		nb=1+(mt.nbits()+1)/2;

// convert exponent to signed 2-bit window 
		for (i=0;i<nb;i++)
		{
			a=(byte)(te.lastbits(3)-4);
			te.dec(a); te.norm(); 
			te.fshr(2);
			b=(byte)(tf.lastbits(3)-4);
			tf.dec(b); tf.norm(); 
			tf.fshr(2);
			w[i]=(byte)(4*a+b);
		}
		w[nb]=(byte)(4*te.lastbits(3)+tf.lastbits(3));
		S.copy(W[(w[nb]-1)/2]);  

		for (i=nb-1;i>=0;i--)
		{
			T.select(W,w[i]);
			S.dbl();
			S.dbl();
			S.add(T);
		}
		S.sub(C); /* apply correction */
		S.affine();
		return S;
	}

// multiply a point by the curves cofactor
	public void cfp()
	{
		int cf=ROM.CURVE_Cof_I;
		if (cf==1) return;
		if (cf==4)
		{
			dbl(); dbl();
			//affine();
			return;
		} 
		if (cf==8)
		{
			dbl(); dbl(); dbl();
			//affine();
			return;
		}
		BIG c=new BIG(ROM.CURVE_Cof);
		copy(mul(c));
	}

/* Hash random Fp element to point on curve */
    public static ECP hashit(BIG h)
    {
        ECP P;

        if (CONFIG_CURVE.CURVETYPE==CONFIG_CURVE.MONTGOMERY)
        { // Elligator 2
            FP X1=new FP();
            FP X2=new FP();
            FP t=new FP(h);
            FP one=new FP(1);
            FP A=new FP(ROM.CURVE_A);
            t.sqr();

            if (CONFIG_FIELD.PM1D2 == 2) {
                t.add(t);
            } 
            if (CONFIG_FIELD.PM1D2 == 1) {
                t.neg();
            }
            if (CONFIG_FIELD.PM1D2 > 2) {
                t.imul(CONFIG_FIELD.QNRI);
            }

            t.add(one);
            t.norm();
            t.inverse();
            X1.copy(t); X1.mul(A);
            X1.neg();
            X2.copy(X1);
            X2.add(A); X2.norm();
            X2.neg();
            FP rhs=RHS(X2);
            X1.cmove(X2,rhs.qr(null));

            BIG a=X1.redc();
            P=new ECP(a);
        } 
        if (CONFIG_CURVE.CURVETYPE==CONFIG_CURVE.EDWARDS)
        { // Elligator 2 - map to Montgomery, place point, map back
            FP X1=new FP();
            FP X2=new FP();
            FP t=new FP(h);
            FP w1=new FP();
            FP w2=new FP();
            FP one=new FP(1);
            FP B=new FP(new BIG(ROM.CURVE_B));
            FP A=new FP(B);
            int sgn=t.sign();
            if (ROM.CURVE_A==1) {
                A.add(one);
                B.sub(one);
            } else {
                A.sub(one);
                B.add(one);
            }
            A.norm(); B.norm();
            FP KB=new FP(B);

            A.div2();
            B.div2();
            B.div2();
            B.sqr();
            
            t.sqr();

            if (CONFIG_FIELD.PM1D2 == 2) {
                t.add(t);
            } 
            if (CONFIG_FIELD.PM1D2 == 1) {
                t.neg();
            }
            if (CONFIG_FIELD.PM1D2 > 2) {
                t.imul(CONFIG_FIELD.QNRI);
            }

            t.add(one); t.norm();
            t.inverse();
            X1.copy(t); X1.mul(A);
            X1.neg();

            X2.copy(X1);
            X2.add(A); X2.norm();
            X2.neg();

            X1.norm();
            t.copy(X1); t.sqr(); w1.copy(t); w1.mul(X1);
            t.mul(A); w1.add(t);
            t.copy(X1); t.mul(B);
            w1.add(t);
            w1.norm();

            X2.norm();
            t.copy(X2); t.sqr(); w2.copy(t); w2.mul(X2);
            t.mul(A); w2.add(t);
            t.copy(X2); t.mul(B);
            w2.add(t);
            w2.norm();

            int qres=w2.qr(null);
            X1.cmove(X2,qres);
            w1.cmove(w2,qres);

            FP Y=w1.sqrt(null);
            t.copy(X1); t.add(t); t.add(t); t.norm();

            w1.copy(t); w1.sub(KB); w1.norm();
            w2.copy(t); w2.add(KB); w2.norm();
            t.copy(w1); t.mul(Y);
            t.inverse();

            X1.mul(t);
            X1.mul(w1);
            Y.mul(t);
            Y.mul(w2);

            BIG x=X1.redc();

            int ne=Y.sign()^sgn;
            FP NY=new FP(Y); NY.neg(); NY.norm();
            Y.cmove(NY,ne);

            BIG y=Y.redc();
            P=new ECP(x,y);
        }

        if (CONFIG_CURVE.CURVETYPE==CONFIG_CURVE.WEIERSTRASS)
        { // swu method
            FP X1=new FP();
            FP X2=new FP();
            FP X3=new FP();
            FP one=new FP(1);
            FP B=new FP(new BIG(ROM.CURVE_B));
            FP Y=new FP();
            FP t=new FP(h);
            BIG x=new BIG(0);
            int sgn=t.sign();
            if (ROM.CURVE_A!=0)
            {
                FP A=new FP(ROM.CURVE_A);
                t.sqr();
                if (CONFIG_FIELD.PM1D2 == 2) {
                    t.add(t);
                } else {
                    t.neg();
                }
                t.norm();
                FP w=new FP(t); w.add(one); w.norm();
                w.mul(t);
                A.mul(w);
                A.inverse();
                w.add(one); w.norm();
                w.mul(B);
                w.neg(); w.norm();
                X2.copy(w); X2.mul(A);
                X3.copy(t); X3.mul(X2);
                FP rhs=RHS(X3);
                X2.cmove(X3,rhs.qr(null));
                rhs.copy(RHS(X2));
                Y.copy(rhs.sqrt(null));
                x.copy(X2.redc());
            } else {
                FP A=new FP(-3);
                FP w=A.sqrt(null);
                FP j=new FP(w); j.sub(one); j.norm(); j.div2();
                w.mul(t);
                B.add(one);
                Y.copy(t); Y.sqr();
                B.add(Y); B.norm(); B.inverse();
                w.mul(B);
                t.mul(w);
                X1.copy(j); X1.sub(t); X1.norm();
                X2.copy(X1); X2.neg(); X2.sub(one); X2.norm();
                w.sqr(); w.inverse();
                X3.copy(w); X3.add(one); X3.norm();
                FP rhs=RHS(X2);
                X1.cmove(X2,rhs.qr(null));
                rhs.copy(RHS(X3));
                X1.cmove(X3,rhs.qr(null));
                rhs.copy(RHS(X1));
                Y.copy(rhs.sqrt(null));
                x.copy(X1.redc());
            }
            int ne=Y.sign()^sgn;
            FP NY=new FP(Y); NY.neg(); NY.norm();
            Y.cmove(NY,ne);

            BIG y=Y.redc();
            P=new ECP(x,y);            
        }
        return P;
    }

/* Map byte string to curve point */
	public static ECP mapit(byte[] h)
	{
		BIG q=new BIG(ROM.Modulus);
        DBIG dx=DBIG.fromBytes(h);
        BIG x=dx.mod(q);
		ECP P=hashit(x);
		P.cfp();
		return P;
	}

	public static ECP generator()
	{
		ECP G;
		BIG gx,gy;
		gx=new BIG(ROM.CURVE_Gx);

		if (CONFIG_CURVE.CURVETYPE!=CONFIG_CURVE.MONTGOMERY)
		{
			gy=new BIG(ROM.CURVE_Gy);
			G=new ECP(gx,gy);
		}
		else
			G=new ECP(gx);
		return G;
	}

}

