class AppTimers {
  constructor(scs, mins, hrs, selector) {
    this.scs = scs;
    this.mins = mins;
    this.hrs = hrs;
    this.tme = null;
    this.selector = selector;
  }
  idleTime = 0;
  apptimerisClosed = false;


  startimer() {
    this.tme = setInterval(async () => {
      if(this.idleTime != 1) {
        this.scs++;
        if (this.scs >= 60) {
          this.scs = 0;
          this.mins++;
          if (this.mins >= 60) {
            this.mins = 0;
            this.hrs++;
          }
        }
      }
      this.selector.textContent = (this.hrs ? (this.hrs > 9 ? this.hrs : "0" + this.hrs) : "00") + ":" + (this.mins ? (this.mins > 9 ? this.mins : "0" + this.mins) : "00") + ":" + (this.scs > 9 ? this.scs : "0" + this.scs);

    }, 1000);

  }
  
  getCurrenttimer() {
    let timeValue;
    return timeValue = {
      scs: this.scs,
      mins: this.mins,
      hrs: this.hrs
    };

  }

  stopCurrenttimer() {
    this.scs = "0";
    this.mins = "0";
    this.hrs = "0";
    clearInterval(this.tme);
    this.selector.textContent = "00:00:00";


  }

  init() {
    this.startimer();
  }

  timerIncrementIdle() {
    setInterval(async () => {
      // console.log("this.timerIncrement");
      this.idleTime = this.idleTime + 1;
      if (this.idleTime > 10) {
        clearInterval(this.tme);
        this.apptimerisClosed = true;
      }

    }, 10000);
  }

  updateIdleTimer() {
    // console.log("this.updateIdleTimer");
    this.idleTime = 0;
    if (this.apptimerisClosed) {
      this.apptimerisClosed = false;
      this.startimer();
    }
  }
}

module.exports = AppTimers;
