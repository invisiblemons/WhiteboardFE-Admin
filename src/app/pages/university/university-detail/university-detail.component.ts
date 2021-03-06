import { Component, OnInit } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { AngularFireStorage } from "angularfire2/storage";
import { ConfirmationService, MenuItem, MessageService } from "primeng/api";
import { finalize } from "rxjs/operators";
import { Campus, Major, University } from "../../university/university.model";
import { UniversityService } from "../university.service";

@Component({
  selector: "app-university-detail",
  templateUrl: "./university-detail.component.html",
  styleUrls: ["./university-detail.component.scss"],
})
export class UniversityDetailComponent implements OnInit {
  displayBasic: boolean;

  displayAllReview: boolean;

  universityId: string;

  university: University;

  campuses: Campus[];

  campus: Campus;

  campusName: string;

  campusNameList = [];

  campusDialog: boolean;

  majorDialog: boolean;

  majorsOfCampus: Major[];

  major: Major;

  majors: Major[];

  imageLogo: string;

  data: any;

  statusColumn: string[];

  currentDay: Date;

  allReviewData: any;

  allReviewOptions: any;

  aReviewData: any;

  aReviewOptions: any;

  selectedImage: any;

  //properties for upload image
  imageUrl: string;

  imgSrc: string;

  formTemplate = new FormGroup({
    imageUrl: new FormControl(""),
  });

  campusImageUrl: string;

  campusImgSrc: string;

  campusFormTemplate = new FormGroup({
    campusImageUrl: new FormControl(""),
  });

  constructor(
    private services: UniversityService,
    private route: ActivatedRoute,
    private router: Router,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private storage: AngularFireStorage
  ) {}

  ngOnInit(): void {
    this.currentDay = new Date();
    this.displayBasic = true;
    this.universityId = this.route.snapshot.paramMap.get("id");
    //get university
    this.services.searchUniversityWithId(this.universityId).subscribe((res) => {
      this.university = res;
      this.imageLogo = this.university.image;
    });
  }

  //hide detail university modal
  onDiscard(): void {
    this.router.navigate(["./university"]);
  }

  //control in campus
  editCampus(campus: Campus) {
    this.campusDialog = true;
    this.campusName = campus.name;
    this.campus = { ...campus };
    this.campusImgSrc = this.campus.image;
  }

  deleteCampus(campus: Campus) {
    
    this.confirmationService.confirm({
      message: "B???n c?? ch???c mu???n xo?? campus " + campus.name + " n??y?",
      header: "X??c nh???n",
      icon: "pi pi-exclamation-triangle",
      accept: () => {
        this.services.deleteCampus(campus.id).subscribe((res) => {
            this.services.searchUniversityWithId(this.universityId).subscribe((res) => {
              this.university = res;
              this.imageLogo = this.university.image;
            })
            this.messageService.add({
              severity: "success",
              summary: "Th??nh c??ng!",
              detail: "Xo?? chi???n d???ch th??nh c??ng",
              life: 3000,
            });
        });
      },
    });
  }

  openNewCampus() {
    this.campus = new Campus(null);
    this.campusDialog = true;
    this.campusImgSrc = "/assets/img/weebly_image_sample.png";
  }

  hideCampusDialog() {
    this.campusDialog = false;
  }

  saveCampus() {
    this.campus.majors = null;
    delete this.campus.majors;
    if (this.campus.name.trim()) {
      //check to upload image
      if (this.selectedImage) {
        if (this.campusFormTemplate.valid) {
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
                  this.campus.image = url;
                  //update campus
                  if (this.campus.id) {
                    this.services.updateCampus(this.campus).subscribe((res) => {
                      if (res) {
                        this.university.campus.forEach((res: Campus, index) => {
                          if (this.campus.id === res.id) {
                            this.university.campus[index].name = this.campus.name;
                  this.university.campus[index].address = this.campus.address;
                  this.university.campus[index].phoneNumber = this.campus.phoneNumber;
                  this.university.campus[index].image = this.campus.image;
                  this.university.campus[index].email = this.campus.email;
                          }
                        });
                        this.messageService.add({
                          severity: "success",
                          summary: "Th??nh c??ng!",
                          detail: "C???p nh???t campus th??nh c??ng",
                          life: 3000,
                        });
                        this.campusDialog = false;
                        this.campus = new Campus(null);
                        this.resetForm();
                      }
                    });
                  } else {
                    //new campus
                    this.campus.universityId = this.universityId;
                    this.services.insertCampus(this.campus).subscribe((res) => {
                      if (res) {
                        this.university.campus = [res].concat(
                          this.university.campus
                        );
                        this.messageService.add({
                          severity: "success",
                          summary: "Th??nh c??ng!",
                          detail: "T???o m???i campus th??nh c??ng",
                          life: 3000,
                        });
                        this.campusDialog = false;
                        this.campus = new Campus(null);
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
        //update campus
        if (this.campus.id) {
          this.services.updateCampus(this.campus).subscribe((res) => {
            if (res) {
              this.university.campus.forEach((res: Campus, index) => {
                if (this.campus.id === res.id) {
                  this.university.campus[index].name = this.campus.name;
                  this.university.campus[index].address = this.campus.address;
                  this.university.campus[index].phoneNumber = this.campus.phoneNumber;
                  this.university.campus[index].image = this.campus.image;
                  this.university.campus[index].email = this.campus.email;
                }
                
              });
              this.messageService.add({
                severity: "success",
                summary: "Th??nh c??ng!",
                detail: "C???p nh???t campus th??nh c??ng",
                life: 3000,
              });
              this.campusDialog = false;
              this.campus = new Campus(null);
            }
          });
        } else {
          //new campus
          this.services.insertCampus(this.campus).subscribe((res) => {
            if (res) {
              this.university.campus = [res].concat(this.university.campus);
              this.messageService.add({
                severity: "success",
                summary: "Th??nh c??ng!",
                detail: "T???o m???i campus th??nh c??ng",
                life: 3000,
              });
              this.campusDialog = false;
              this.campus = new Campus(null);
            }
          });
        }
      }
    }
  }

  //control in Major modal
  editMajor(major: Major) {
    this.majorDialog = true;
    this.major = { ...major };
  }

  openNewMajor() {
    this.major = new Major(null);
    this.majorDialog = true;
  }
  deleteMajor(campus, major) {
    this.confirmationService.confirm({
      message: "B???n c?? ch???c mu???n xo?? ng??nh " + major.name + " n??y?",
      header: "X??c nh???n",
      icon: "pi pi-exclamation-triangle",
      accept: () => {
        this.services.deleteMajor(major.id).subscribe((res) => {
          this.services.searchUniversityWithId(this.universityId).subscribe((res) => {
            this.university = res;
            this.imageLogo = this.university.image;
          })
            this.messageService.add({
              severity: "success",
              summary: "Th??nh c??ng!",
              detail: "xo?? ng??nh n??y th??nh c??ng",
              life: 3000,
            });
        });
      },
    });
  }
  saveMajor(campus: Campus, major: Major) {
    major.campusId = campus.id;
    if (major.code.trim()) {
      //update Major
      if (major.id) {
        this.services.updateMajor(major).subscribe((res) => {
          if (res) {
            this.services.searchUniversityWithId(this.universityId).subscribe((res) => {
              this.university = res;
              this.imageLogo = this.university.image;
            })
            this.messageService.add({
              severity: "success",
              summary: "Th??nh c??ng!",
              detail: "C???p nh???t ng??nh h???c th??nh c??ng",
              life: 3000,
            });
          }
        });
      } else {
        //new Major
        this.services.insertMajor(major).subscribe((res) => {
          if (res) {
            this.services.searchUniversityWithId(this.universityId).subscribe((res) => {
              this.university = res;
              this.imageLogo = this.university.image;
            })
            this.messageService.add({
              severity: "success",
              summary: "Th??nh c??ng!",
              detail: "T???o m???i ng??nh h???c th??nh c??ng",
              life: 3000,
            });
          }
        });
      }
      this.majorDialog = false;
      this.major = new Major(null);
    }
  }

  hideMajorDialog() {
    this.majorDialog = false;
  }

  openMajorsOfUniversity(campus: Campus) {
    this.campus = campus;
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
  showCampusPreview(event: any) {
    if (event.target.files && event.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (e: any) => (this.campusImgSrc = e.target.result);
      reader.readAsDataURL(event.target.files[0]);
      this.selectedImage = event.target.files[0];
    } else {
      this.campusImgSrc = "/assets/img/weebly_image_sample.png";
      this.selectedImage = null;
    }
  }
  resetForm() {
    this.selectedImage = null;

    this.formTemplate.reset();
    this.formTemplate.setValue({
      imageUrl: "",
    });
    this.imgSrc = "/assets/img/weebly_image_sample.png";

    this.campusFormTemplate.reset();
    this.campusFormTemplate.setValue({
      campusImageUrl: "",
    });
    this.campusImgSrc = "/assets/img/weebly_image_sample.png";
  }
}
