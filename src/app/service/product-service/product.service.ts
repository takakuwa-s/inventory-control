import { Injectable, Inject, LOCALE_ID } from '@angular/core';
import { Product } from '../../model/product';
import { FirebaseStorageService } from './../firebase-storage-service/firebase-storage.service';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument, QueryFn, CollectionReference } from '@angular/fire/firestore';
import { formatDate } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  constructor(
    private _firebaseStorageService: FirebaseStorageService,
    private _afStore: AngularFirestore,
    @Inject(LOCALE_ID) private _locale: string
    ) {}

  public fetchProductListFilteringCompany(companyId: string): Observable<Product[]>{
    const queryFn: QueryFn = (ref: CollectionReference) => {
      return ref.orderBy('nameKana', 'asc').where('companyId','==', companyId);
    }

    return this.fetchAllProducts(queryFn);
  }

  public fetchAllProducts(queryFn?: QueryFn): Observable<Product[]> {

    if(!queryFn) {
      queryFn = (ref: CollectionReference) => {
        return ref.orderBy('companyName', 'asc').orderBy('nameKana', 'asc');
      }
    }
    let collectionProduct: AngularFirestoreCollection<Product> = this._afStore.collection('products/', queryFn);
    return collectionProduct.get().pipe(
      map((querySnapshot: firebase.firestore.QuerySnapshot) => {
        let list: Product[] = [];
        querySnapshot.forEach((doc: firebase.firestore.QueryDocumentSnapshot) => {
          if (doc.exists) {
            list.push(doc.data() as Product);
          }
        });
        return list;
      })
    );
  }

  fetchProductById(id: string): Observable<Product> {
    const docProduct: AngularFirestoreDocument<Product> = this._afStore.doc(`products/${id}`);
    return docProduct.get().pipe(
      map((doc: firebase.firestore.QueryDocumentSnapshot) => {
        if (doc.exists) {
          return doc.data() as Product;
        } else {
          return null;
        }
      })
    );
  }

  public getFilePath(imageFile: File, date: Date): string {
    const dateImp = formatDate(date, "yyyyMMdd_HHmm", this._locale);
    return `images/product/${imageFile.name}_${dateImp}`;
  }

  saveProduct(product: Product): Observable<void> {
    const docProduct: AngularFirestoreDocument<Product> = this._afStore.doc(`products/${product.id}`);
    return from(docProduct.set(product));
  }

  public saveProductFromArr(arrProduct: Product[]): Observable<void> {

    const batch = this._afStore.firestore.batch();

    arrProduct.forEach((pr: Product) => {
      const ref: firebase.firestore.DocumentReference = this._afStore.firestore.collection('products/').doc(pr.id);
      batch.set(ref, pr);
    });

    return from(batch.commit());
  }

  deleteProductById(productId: string): Observable<void> {
    const docProduct: AngularFirestoreDocument<Product> = this._afStore.doc(`products/${productId}`);
    return from(docProduct.delete());
  }
}
