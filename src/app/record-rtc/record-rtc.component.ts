import {Component, ViewChild, AfterViewInit} from '@angular/core';

let RecordRTC = require('recordrtc/RecordRTC.min');
import {Http} from '@angular/http';
import 'rxjs/add/operator/toPromise';
import {Observable, Subscription} from 'rxjs/Rx';
import {SimpleTimer} from 'ng2-simple-timer';
import {Router} from '@angular/router';


@Component({
  selector: 'record-rtc',
  templateUrl: './record-rtc.component.html',
  styleUrls: ['./record-rtc.component.scss']
})
export class RecordRTCComponent implements AfterViewInit {

  private stream: MediaStream;
  private recordRTC: any;
  @ViewChild('video') video;
  private blob: Blob;
  ticks = 0;
  minutesDisplay: number = 1;
  secondsDisplay: number = 59;
  skip: number = 0;
  sDisplay: number = 59;
  str: string = '';
  count: number = 0;
  butn = true;

  list: Array<String> = ['1. Can you tell me a little about yourself?', '2. How did you hear about the position?', '3. What do you know about the company?',
  '4. Can you tell me a little about yourself?', '5. Can you tell me a little about yourself?'];


  sub: Subscription;

  constructor(private http: Http, private st: SimpleTimer, private router: Router) {
  }

  ngAfterViewInit() {
    // set the initial state of the video
    let video: HTMLVideoElement = this.video.nativeElement;
    video.muted = false;
    video.controls = true;
    video.autoplay = false;
  }

  toggleControls() {
    let video: HTMLVideoElement = this.video.nativeElement;
    video.muted = !video.muted;
    video.controls = !video.controls;
    video.autoplay = !video.autoplay;
  }

  successCallback(stream: MediaStream) {

    let options = {
      mimeType: 'video/webm', // or video/webm\;codecs=h264 or video/webm\;codecs=vp9
      audioBitsPerSecond: 128000,
      videoBitsPerSecond: 128000,
      bitsPerSecond: 128000 // if this line is provided, skip above two
    };
    this.stream = stream;
    this.recordRTC = RecordRTC(stream, options);
    this.recordRTC.startRecording();
    let video: HTMLVideoElement = this.video.nativeElement;
    video.src = window.URL.createObjectURL(stream);
    this.toggleControls();
  }

  errorCallback() {
  }

  processVideo(audioVideoWebMURL) {
    let video: HTMLVideoElement = this.video.nativeElement;
    let recordRTC = this.recordRTC;
    video.src = audioVideoWebMURL;
    this.toggleControls();
    let recordedBlob = recordRTC.getBlob();
    recordRTC.getDataURL(function (dataURL) {
    });
  }

  startRecording() {
    this.startTimer();
    let mediaConstraints = {
      video: {
        mandatory: {
          minWidth: 1280,
          minHeight: 720
        }
      }, audio: true
    };
    navigator.mediaDevices
      .getUserMedia(mediaConstraints)
      .then(this.successCallback.bind(this), this.errorCallback.bind(this));


  }

  stopRecording() {
    console.log(this.list[1]);
    let recordRTC = this.recordRTC;
    recordRTC.stopRecording(this.processVideo.bind(this));
    let stream = this.stream;
    stream.getAudioTracks().forEach(track => track.stop());
    stream.getVideoTracks().forEach(track => track.stop());
    this.sub.unsubscribe();
  }

  download() {
    this.blob = this.recordRTC.getBlob();
    let file = new File([this.blob], 'Ularbek Zairbekov', {
      type: 'video/webm'
    });
    let formData = new FormData();
    formData.append('file', file); // upload "File" object rather than a "Blob"
    console.log(this.blob);
    this.http.post('http://localhost:8085/uploadFile', formData).subscribe((r) => {
      console.error('Response ' + JSON.stringify(r.json()));
      alert('Form submitted with values ' + file.name);
    }, (error) => {
      console.error('Response ' + error.json());
      alert('Error in form ' + error.json());
    });
    this.router.navigateByUrl('/about');
     this.sub.unsubscribe();
  }

  private startTimer() {
    this.secondsDisplay = 0;
     let timer = Observable.timer(1, 1000);
    this.sub = timer.subscribe(
      t => {
        this.ticks = t;
        if (this.count === 4) {
          this.butn = false;
        }
        if (this.count === 5) {
          this.sub.unsubscribe();
          this.stopRecording();
          this.minutesDisplay = 0;
          this.secondsDisplay = 0;
        }
        if (t === 119 || this.skip === 1) {
          this.sub.unsubscribe();
          this.str = '';
          this.minutesDisplay = 1;
          this.sDisplay = 59;
          this.count = this.count + 1;
          this.startTimer();
          this.skip = 0;
        }
        if (this.count === 4 && t === 119) {
          this.stopRecording();
        }
        console.log(t);
        if (t === 50 || t === 109) {
          this.str = '0';
        }
        if (t === 59) {
          this.str = '';
          this.minutesDisplay = 0;
          this.sDisplay = 118;
        }
        this.secondsDisplay = this.sDisplay - this.ticks;
      }
    );
  }
  private nextQ() {
    this.skip = 1;
    console.log('hello');
  }

}

