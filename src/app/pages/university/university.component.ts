import { Component, OnInit } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import { Router } from "@angular/router";
import { AngularFireStorage } from "angularfire2/storage";
import { ConfirmationService, MessageService } from "primeng/api";
import { finalize } from "rxjs/operators";
import { University } from "./university.model";
import { UniversityService } from "./university.service";

@Component({
  selector: "app-university",
  templateUrl: "./university.component.html",
  styleUrls: ["./university.component.scss"],
})
export class UniversityComponent implements OnInit {
  first = 0;

  rows = 5;

  universities: University[];

  rootDataUniversities: University[];

  university: University;

  newUniverisityDialog: boolean;

  searchUniResults: University[];

  isShowSpin: boolean;

  imgSrc: string;

  selectedImage: any;

  searchText: string;

  selectedUniversities: University[];

  formTemplate = new FormGroup({
    imageUrl: new FormControl(""),
  });

  constructor(
    private services: UniversityService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private storage: AngularFireStorage,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.searchText = "";
    this.isShowSpin = true;
    this.newUniverisityDialog = false;
    this.services.getUniversities().subscribe((res) => {
      this.universities = res["universitys"];
      this.isShowSpin = false;
    });
    this.rootDataUniversities = this.universities;
  }

  // paging
  next() {
    this.first = this.first + this.rows;
  }

  prev() {
    this.first = this.first - this.rows;
  }

  reset() {
    this.first = 0;
  }

  isLastPage(): boolean {
    return this.universities
      ? this.first === this.universities.length - this.rows
      : true;
  }

  isFirstPage(): boolean {
    return this.universities ? this.first === 0 : true;
  }

  // end-paging

  openNewUniversity() {
    this.newUniverisityDialog = true;
    this.university = new University(null);
    this.imgSrc = "/assets/img/weebly_image_sample.png";
  }

  searchUni() {
    this.searchUniResults = [];
    if (this.searchText !== "") {
      this.universities.forEach((uni) => {
        if (uni.name.includes(this.searchText)) {
          this.searchUniResults.push(uni);
        }
      });
      this.universities = this.searchUniResults;
    } else if (this.searchText === "") {
      this.universities = this.rootDataUniversities;
    }
  }

  openDetailUniModal(university: University) {
    this.router.navigate([
      "./university/university-detail",
      { id: university.id },
    ]);
  }

  // open modal edit & delete
  editUni(university: University) {
    this.imgSrc = university.image;
    this.university = { ...university };
    this.newUniverisityDialog = true;
  }

  //image
  showPreview(event: any) {
    if (event.target.files && event.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (e: any) => (this.imgSrc = e.target.result);
      reader.readAsDataURL(event.target.files[0]);
      this.selectedImage = event.target.files[0];
    } else {
      this.imgSrc = "/assets/img/weebly_image_sample.png";
      this.selectedImage = null;
    }
  }

  hideUniDialog() {
    this.newUniverisityDialog = false;
  }

  saveUniversity() {
    if (this.university.name.trim()) {
      //check to upload image
      if (null !== this.selectedImage) {
        if (this.formTemplate.valid) {
          var filePath = `${this.selectedImage.name
            .split(".")
            .slice(0, -1)
            .join(".")}_${new Date().getTime()}`;
          const fileRef = this.storage.ref(filePath);
          this.storage
            .upload(filePath, this.selectedImage)
            .snapshotChanges()
            .pipe(
              finalize(() => {
                fileRef.getDownloadURL().subscribe((url) => {
                  this.university.image = url;
                  //update uni
                  if (this.university.id) {
                    this.services
                      .updateUniversity(this.university)
                      .subscribe((res) => {
                        if (res) {
                          this.universities.forEach(
                            (uni: University, index) => {
                              if ((this.university.id === uni.id)) {
                                this.universities[index] = this.university;
                              }
                            }
                          );
                          this.messageService.add({
                            severity: "success",
                            summary: "Th??nh c??ng!",
                            detail: "C???p nh???t tr?????ng ?????i h???c th??nh c??ng",
                            life: 3000,
                          });
                          this.newUniverisityDialog = false;
                          this.university = new University(null);
                          this.resetForm();
                        }
                      });
                  } else {
                    //create new campaign
                    this.services
                      .insertUniversity(this.university)
                      .subscribe((res) => {
                        if (res) {
                          this.universities = [this.university].concat(
                            this.universities
                          );
                          this.messageService.add({
                            severity: "success",
                            summary: "Th??nh c??ng!",
                            detail: "T???o m???i tr?????ng ?????i h???c th??nh c??ng",
                            life: 3000,
                          });
                          this.newUniverisityDialog = false;
                          this.university = new University(null);
                          this.resetForm();
                        }
                      });
                  }
                });
              })
            )
            .subscribe();
        }
      } else {
        //update uni
        if (this.university.id) {
          this.services.updateUniversity(this.university).subscribe((res) => {
            if (res) {
              this.universities.forEach((uni: University, index) => {
                if ((this.university.id === uni.id)) {
                  this.universities[index] = this.university;
                }
              });
              this.messageService.add({
                severity: "success",
                summary: "Th??nh c??ng!",
                detail: "C???p nh???t tr?????ng ?????i h???c th??nh c??ng",
                life: 3000,
              });
              this.newUniverisityDialog = false;
              this.university = new University(null);
            }
          });
        } else {
          //create new campaign
          this.services.insertUniversity(this.university).subscribe((res) => {
            if (res) {
              this.universities = [this.university].concat(this.universities);
              this.messageService.add({
                severity: "success",
                summary: "Th??nh c??ng!",
                detail: "T???o m???i tr?????ng ?????i h???c th??nh c??ng",
                life: 3000,
              });
              this.newUniverisityDialog = false;
              this.university = new University(null);
            }
          });
        }
      }
    }
  }

  resetForm() {
    this.formTemplate.reset();
    this.formTemplate.setValue({
      imageUrl: "",
    });

    this.imgSrc = "/assets/img/weebly_image_sample.png";
    this.selectedImage = null;
  }

  reloadUniversities() {
    this.isShowSpin = true;
    this.services.getReloadUniversities().subscribe((res) => {
      if (null !== res) {
        this.universities = res["universitys"];
        this.isShowSpin = false;
        this.messageService.add({
          severity: "success",
          summary: "Th??nh c??ng!",
          detail: "Reload tr??n redis th??nh c??ng",
          life: 3000,
        });
      }
    });
  }

  deleteUni(university: University) {
    this.confirmationService.confirm({
      message: "B???n c?? ch???c mu???n xo?? tr?????ng " + university.name + "?",
      header: "X??c nh???n",
      icon: "pi pi-exclamation-triangle",
      accept: () => {
        this.services.deleteUniversity(university.id).subscribe((res) => {
          if (res) {
            this.universities = this.universities.filter(
              (val) => val.id !== university.id
            );
            this.university = new University(null);
            this.messageService.add({
              severity: "success",
              summary: "Th??nh c??ng!",
              detail: "Xo?? tr?????ng ?????i h???c th??nh c??ng",
              life: 3000,
            });
          }
        });
      },
    });
  }

  deleteSelectedUniversities() {}
}
