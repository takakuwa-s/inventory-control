import { Component, OnInit } from '@angular/core';
import { Product, DetailProduct, initDetailProduct } from '../../model/product';
import { Company } from './../../model/company';
import { Material } from './../../model/material';
import { MaterialTypeEn, MaterialTypeJa } from './../../model/material-type';
import { MaterialService } from './../../service/material-service/material.service';
import { CompanyService } from './../../service/company-service/company.service';
import { ProductService } from './../../service/product-service/product.service';
import { FirebaseStorageService } from './../../service/firebase-storage-service/firebase-storage.service';
import { AngularFirestore } from 'angularfire2/firestore';
declare const $;

@Component({
  selector: 'app-register-product',
  templateUrl: './register-product.component.html',
  styleUrls: ['./register-product.component.css']
})
export class RegisterProductComponent implements OnInit {
  public loading = true;
  private _bottleLoaded = false;
  private _cartonLoaded = false;
  private _labelLoaded = false;
  private _triggerLoaded = false;
  private _bagLoaded = false;
  private _companyLoaded = false;

  public registerProduct: DetailProduct;

  public bottleLists: Material[];
  public cartonLists: Material[];
  public labelLists: Material[];
  public triggerLists: Material[];
  public bagLists: Material[];
  public companyLists: Company[];

  public isBagSelected: boolean;
  public isBottleSelected: boolean;
  public isCartonSelected: boolean;
  public isLabelSelected: boolean;
  public isTriggerSelected: boolean;
  public isCompanySelected: boolean;

  public showBagAlert: boolean;
  public showBottleAlert: boolean;
  public showCartonAlert: boolean;
  public showLabelAlert: boolean;
  public showTriggerAlert: boolean;
  public showCompanyAlert: boolean;

  public readonly nameKanaPattern: string = '^[ -~-ぁ-ん-ー]*$';
  public readonly countPattern: string = '^[1-9][0-9]*$';

  public readonly confirmTitle = '登録確認';
  public confirmBody: string;
  public readonly confirmCancelBtn = '閉じる';
  public readonly confirmActionBtn = '登録';

  public completeBody: string; 
  public completeBtnType: string;

  public isInitInputImage: boolean;
  private _selectedImage: File;

  constructor (
    private _materialService: MaterialService,
    private _companyService: CompanyService,
    private _firebaseStorageService: FirebaseStorageService,
    private _productService: ProductService,
    private _afStore: AngularFirestore
  ) { }

  ngOnInit() {
    this._fetchAllDatas();
    this.formInit();
  }

  createBody(){
    const fileName = this._selectedImage ? this._selectedImage.name : '未選択';

    if (this.registerProduct.bottleData.id === '') {
      this.registerProduct.bottleData.id = null;
      this.registerProduct.bottleData.name = '-';
    }

    if (this.registerProduct.cartonData.id === '') {
      this.registerProduct.cartonData.id = null;
      this.registerProduct.cartonData.name = '-';
    }

    if (this.registerProduct.labelData.id === '') {
      this.registerProduct.labelData.id = null;
      this.registerProduct.labelData.name = '-';
    }

    if (this.registerProduct.triggerData.id === '') {
      this.registerProduct.triggerData.id = null;
      this.registerProduct.triggerData.name = '-';
    }

    if (this.registerProduct.bagData.id === '') {
      this.registerProduct.bagData.id = null;
      this.registerProduct.bagData.name = '-';
    }

    if (this.registerProduct.companyData.id === '') {
      this.registerProduct.companyData.id = null;
      this.registerProduct.companyData.name = '-';
    }

    console.log(this.registerProduct);

    this.confirmBody = `
    <div class="container-fluid">
      <p>以下の内容で登録してもよろしいでしょうか？</p>
      <div class="row">
        <div class="col-4">名前</div>
        <div class="col-8 pull-left">${this.registerProduct.name}</div>
      </div>
      <div class="row">
        <div class="col-4">かな</div>
        <div class="col-8 pull-left">${this.registerProduct.nameKana}</div>
      </div>
      <div class="row">
        <div class="col-4">ボトル</div>
        <div class="col-8 pull-left">${this.registerProduct.bottleData.name}</div>
      </div>
      <div class="row">
        <div class="col-4">カートン</div>
        <div class="col-8 pull-left">${this.registerProduct.cartonData.name}</div>
      </div>
      <div class="row">
        <div class="col-4">ラベル</div>
        <div class="col-8 pull-left">${this.registerProduct.labelData.name}</div>
      </div>
      <div class="row">
        <div class="col-4">トリガー</div>
        <div class="col-8 pull-left">${this.registerProduct.triggerData.name}</div>
      </div>
      <div class="row">
        <div class="col-4">詰め替え袋</div>
        <div class="col-8 pull-left">${this.registerProduct.bagData.name}</div>
      </div>
      <div class="row">
        <div class="col-4">得意先</div>
        <div class="col-8 pull-left">${this.registerProduct.companyData.name}</div>
      </div>
      <div class="row">
        <div class="col-4">商品入り数</div>
        <div class="col-8 pull-left">${this.registerProduct.lot}</div>
      </div>
      <div class="row">
        <div class="col-4">画像</div>
        <div class="col-8 pull-left">${fileName}</div>
      </div>
    </div>`;
  }

  submit(): void {
    this.loading = true;

    const product: Product = {
      id: this._afStore.createId(),
      name: this.registerProduct.name.trim(),
      nameKana: this.registerProduct.nameKana.trim(),
      lot: Number(this.registerProduct.lot),
      imageUrl: '',
      companyId: this.registerProduct.companyData.id,
      companyName: this.registerProduct.companyData.name,
      bottleId: this.registerProduct.bottleData.id,
      bottleName: this.registerProduct.bottleData.name,
      cartonId: this.registerProduct.cartonData.id,
      cartonName: this.registerProduct.cartonData.name,
      labelId: this.registerProduct.labelData.id,
      labelName: this.registerProduct.labelData.name,
      triggerId: this.registerProduct.triggerData.id,
      triggerName: this.registerProduct.triggerData.name,
      bagId: this.registerProduct.bagData.id,
      bagName: this.registerProduct.bagData.name,
    }

    if (this._selectedImage === undefined) {
      this._saveProduct(product);
    } else {
      const filePath = this._productService.getFilePath(this._selectedImage, new Date);
      product.imageUrl = filePath;
      this._firebaseStorageService.saveFile(this._selectedImage, filePath).subscribe((res) => {
        this._saveProduct(product);
      }, (err) => {
        console.error(err);
        this.completeBody = '※ 登録に失敗しました。';
        this.completeBtnType = 'btn-danger';
        this.openCompleteModal();
      });
    }
  }

  private _saveProduct(product: Product) {
    this._productService.saveProduct(product).subscribe(() =>{
      this.completeBody = '登録が完了しました。';
      this.completeBtnType = 'btn-outline-success';
      this.openCompleteModal();
    }, (err) => {
      console.error(err);
      this.completeBody = '※ 登録に失敗しました。';
      this.completeBtnType = 'btn-danger';
      this.openCompleteModal();
    });
  }

  formInit() :void {
    this.registerProduct = initDetailProduct();

    this.isBottleSelected = false;
    this.isCartonSelected = false;
    this.isLabelSelected = false;
    this.isTriggerSelected = false;
    this.isBagSelected = false;
    this.isCompanySelected = false;
  
    this.showBottleAlert = false;
    this.showCartonAlert = false;
    this.showLabelAlert = false;
    this.showTriggerAlert = false;
    this.showBagAlert = false;
    this.showCompanyAlert = false;

    $('#bottle').val("");
    $('#carton').val("");
    $('#label').val("");
    $('#trigger').val("");
    $('#bag').val("");
    $('#company').val("");

    this._selectedImage = undefined;
    this.isInitInputImage = true;
  }

  autocompleListFormatter = (data: any) => {
    return `<span>${data.name}</span>`;
  }

  selectMaterial(data: any, type: string) :void {
    switch(type){
      case MaterialTypeEn.bo:
      case MaterialTypeJa.bo:
        if (typeof data === 'string') {
          this.showBottleAlert = true;
        } else {
          this.showBottleAlert = false;
          this.registerProduct.bottleData = data; 
          this.isBottleSelected = true;
        }
        break;
      case MaterialTypeEn.ca:
      case MaterialTypeJa.ca:
        if (typeof data === 'string') {
          this.showCartonAlert = true;
        } else {
          this.showCartonAlert = false;
          this.registerProduct.cartonData = data; 
          this.isCartonSelected = true;
          break;
        }
      case MaterialTypeEn.la:
      case MaterialTypeJa.la:
        if (typeof data === 'string') {
          this.showLabelAlert = true;
        } else {
          this.showLabelAlert = false;
          this.registerProduct.labelData = data; 
          this.isLabelSelected = true;
        }
        break;
      case MaterialTypeEn.tr:
      case MaterialTypeJa.tr:
        if (typeof data === 'string') {
          this.showTriggerAlert = true;
        } else {
          this.showTriggerAlert = false;
          this.registerProduct.triggerData = data; 
          this.isTriggerSelected = true;
        }
        break;
      case MaterialTypeEn.ba:
      case MaterialTypeJa.ba:
        if (typeof data === 'string') {
          this.showBagAlert = true;
        } else {
          this.showBagAlert = false;
          this.registerProduct.bagData = data; 
          this.isBagSelected = true;
        }
        break;
      case 'company':
      case '得意先':
        if (typeof data === 'string') {
          this.showCompanyAlert = true;
        } else {
          this.showCompanyAlert = false;
          this.registerProduct.companyData = data; 
          this.isCompanySelected = true;
        }
        break;
      default:
        console.error('typeおかしいよ？ : ' + type);
    }
  }

  public imageLoadFailed() {
    this.completeBody = '※ 画像の読み込みに失敗しました。';
    this.completeBtnType = 'btn-danger';
    this.openCompleteModal();
  }

  public selectImage(file: File) {
    this._selectedImage = file;
    this.isInitInputImage = false;
  }

  private _fetchAllDatas():void {

    this._materialService.fetchMaterialLists(MaterialTypeEn.bo).subscribe((res: Material[]) => {
      this.bottleLists = res;
      this._bottleLoaded = true;
      this._checkLoaded();
    }, (err) => {
      console.error(err);
      this.completeBody = `※ ${MaterialTypeJa.bo}データの取得に失敗しました。`;
      this.completeBtnType = 'btn-danger';
      this.openCompleteModal();
    });

    this._materialService.fetchMaterialLists(MaterialTypeEn.ca).subscribe((res: Material[]) => {
      this.cartonLists = res;
      this._cartonLoaded = true;
      this._checkLoaded();
    }, (err) => {
      console.error(err);
      this.completeBody = `※ ${MaterialTypeJa.ca}データの取得に失敗しました。`;
      this.completeBtnType = 'btn-danger';
      this.openCompleteModal();
    });

    this._materialService.fetchMaterialLists(MaterialTypeEn.la).subscribe((res: Material[]) => {
      this.labelLists = res;
      this._labelLoaded = true;
      this._checkLoaded();
    }, (err) => {
      console.error(err);
      this.completeBody = `※ ${MaterialTypeJa.la}データの取得に失敗しました。`;
      this.completeBtnType = 'btn-danger';
      this.openCompleteModal();
    });

    this._materialService.fetchMaterialLists(MaterialTypeEn.tr).subscribe((res: Material[]) => {
      this.triggerLists = res;
      this._triggerLoaded = true;
      this._checkLoaded();
    }, (err) => {
      console.error(err);
      this.completeBody = `※ ${MaterialTypeJa.tr}データの取得に失敗しました。`;
      this.completeBtnType = 'btn-danger';
      this.openCompleteModal();
    });

    this._materialService.fetchMaterialLists(MaterialTypeEn.ba).subscribe((res: Material[]) => {
      this.bagLists = res;
      this._bagLoaded = true;
      this._checkLoaded();
    }, (err) => {
      console.error(err);
      this.completeBody = `※ ${MaterialTypeJa.ba}データの取得に失敗しました。`;
      this.completeBtnType = 'btn-danger';
      this.openCompleteModal();
    });

    this._companyService.fetchCompanies().subscribe((res: Company[]) => {
      this.companyLists = res;
      this._companyLoaded = true;
      this._checkLoaded();
    }, (err) => {
      console.error(err);
      this.completeBody = `※ 得意先データの取得に失敗しました。`;
      this.completeBtnType = 'btn-danger';
      this.openCompleteModal();
    });
  }

  private _checkLoaded() {
    if (this._bottleLoaded && this._cartonLoaded && this._labelLoaded && this._triggerLoaded && this._bagLoaded && this._companyLoaded) {
      this.loading = false;
    }
  }

  private openCompleteModal(): void {
    this.loading = false;
    $('#CompleteModal').modal();

    setTimeout(() =>{
      this.closeCompleteModal();
    },3000);
  };

  private closeCompleteModal(): void {
    $('body').removeClass('modal-open');
    $('.modal-backdrop').remove();
    $('#CompleteModal').modal('hide');
  }

}