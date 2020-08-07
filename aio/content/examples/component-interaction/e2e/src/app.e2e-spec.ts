import { browser, element, by } from 'protractor';

describe('Component Communication Cookbook Tests', () => {

  // Note: '?e2e' which app can read to know it is running in protractor
  // e.g. `if (!/e2e/.test(location.search)) { ...`
  beforeAll(() => {
    browser.get('?e2e');
  });

  describe('Parent-to-child communication', () => {
    // #docregion parent-to-child
    // ...
    const heroNames = ['Dr IQ', 'Magneta', 'Bombasto'];
    const masterName = 'Master';

    it('should pass properties to children properly', () => {
      const parent = element.all(by.tagName('app-hero-parent')).get(0);
      const heroes = parent.all(by.tagName('app-hero-child'));

      for (let i = 0; i < heroNames.length; i++) {
        const childTitle = heroes.get(i).element(by.tagName('h3')).getText();
        const childDetail = heroes.get(i).element(by.tagName('p')).getText();
        expect(childTitle).toEqual(heroNames[i] + ' says:');
        expect(childDetail).toContain(masterName);
      }
    });
    // ...
    // #enddocregion parent-to-child
  });

  describe('Parent-to-child communication with setter', () => {
    // #docregion parent-to-child-setter
    // ...
    it('should display trimmed, non-empty names', () => {
      const nonEmptyNameIndex = 0;
      const nonEmptyName = '"Dr IQ"';
      const parent = element.all(by.tagName('app-name-parent')).get(0);
      const hero = parent.all(by.tagName('app-name-child')).get(nonEmptyNameIndex);

      const displayName = hero.element(by.tagName('h3')).getText();
      expect(displayName).toEqual(nonEmptyName);
    });

    it('should replace empty name with default name', () => {
      const emptyNameIndex = 1;
      const defaultName = '"<no name set>"';
      const parent = element.all(by.tagName('app-name-parent')).get(0);
      const hero = parent.all(by.tagName('app-name-child')).get(emptyNameIndex);

      const displayName = hero.element(by.tagName('h3')).getText();
      expect(displayName).toEqual(defaultName);
    });
    // ...
    // #enddocregion parent-to-child-setter
  });

  describe('Parent-to-child communication with ngOnChanges', () => {
    // #docregion parent-to-child-onchanges
    // ...
    // Test must all execute in this exact order
    it('should set expected initial values', () => {
      const actual = getActual();

      const initialLabel = 'Version 1.23';
      const initialLog = 'Initial value of major set to 1, Initial value of minor set to 23';

      expect(actual.label).toBe(initialLabel);
      expect(actual.count).toBe(1);
      expect(actual.logs.get(0).getText()).toBe(initialLog);
    });

    it('should set expected values after clicking \'Minor\' twice', () => {
      const repoTag = element(by.tagName('app-version-parent'));
      const newMinorButton = repoTag.all(by.tagName('button')).get(0);

      newMinorButton.click().then(() => {
        newMinorButton.click().then(() => {
          const actual = getActual();

          const labelAfter2Minor = 'Version 1.25';
          const logAfter2Minor = 'minor changed from 24 to 25';

          expect(actual.label).toBe(labelAfter2Minor);
          expect(actual.count).toBe(3);
          expect(actual.logs.get(2).getText()).toBe(logAfter2Minor);
        });
      });
    });

    it('should set expected values after clicking \'Major\' once', () => {
      const repoTag = element(by.tagName('app-version-parent'));
      const newMajorButton = repoTag.all(by.tagName('button')).get(1);

      newMajorButton.click().then(() => {
        const actual = getActual();

        const labelAfterMajor = 'Version 2.0';
        const logAfterMajor = 'major changed from 1 to 2, minor changed from 25 to 0';

        expect(actual.label).toBe(labelAfterMajor);
        expect(actual.count).toBe(4);
        expect(actual.logs.get(3).getText()).toBe(logAfterMajor);
      });
    });

    function getActual() {
      const versionTag = element(by.tagName('app-version-child'));
      const label = versionTag.element(by.tagName('h3')).getText();
      const ul = versionTag.element((by.tagName('ul')));
      const logs = ul.all(by.tagName('li'));

      return {
        label,
        logs,
        count: logs.count()
      };
    }
    // ...
    // #enddocregion parent-to-child-onchanges

  });

  describe('Child-to-parent communication', () => {
    // #docregion child-to-parent
    // ...
    it('should not emit the event initially', () => {
      const voteLabel = element(by.tagName('app-vote-taker'))
        .element(by.tagName('h3')).getText();
      expect(voteLabel).toBe('Agree: 0, Disagree: 0');
    });

    it('should process Agree vote', () => {
      const agreeButton1 = element.all(by.tagName('app-voter')).get(0)
        .all(by.tagName('button')).get(0);
      agreeButton1.click().then(() => {
        const voteLabel = element(by.tagName('app-vote-taker'))
          .element(by.tagName('h3')).getText();
        expect(voteLabel).toBe('Agree: 1, Disagree: 0');
      });
    });

    it('should process Disagree vote', () => {
      const agreeButton1 = element.all(by.tagName('app-voter')).get(1)
        .all(by.tagName('button')).get(1);
      agreeButton1.click().then(() => {
        const voteLabel = element(by.tagName('app-vote-taker'))
          .element(by.tagName('h3')).getText();
        expect(voteLabel).toBe('Agree: 1, Disagree: 1');
      });
    });
    // ...
    // #enddocregion child-to-parent
  });

  // Can't run timer tests in protractor because
  // interaction w/ zones causes all tests to freeze & timeout.
  xdescribe('Parent calls child via local var', () => {
    countDownTimerTests('countdown-parent-lv');
  });

  xdescribe('Parent calls ViewChild', () => {
    countDownTimerTests('countdown-parent-vc');
  });

  function countDownTimerTests(parentTag: string) {
    // #docregion countdown-timer-tests
    // ...
    it('timer and parent seconds should match', () => {
      const parent = element(by.tagName(parentTag));
      const message = parent.element(by.tagName('app-countdown-timer')).getText();
      browser.sleep(10); // give `seconds` a chance to catchup with `message`
      const seconds = parent.element(by.className('seconds')).getText();
      expect(message).toContain(seconds);
    });

    it('should stop the countdown', () => {
      const parent = element(by.tagName(parentTag));
      const stopButton = parent.all(by.tagName('button')).get(1);

      stopButton.click().then(() => {
        const message = parent.element(by.tagName('app-countdown-timer')).getText();
        expect(message).toContain('Holding');
      });
    });
    // ...
    // #enddocregion countdown-timer-tests
  }


  describe('Parent and children communicate via a service', () => {
    // #docregion bidirectional-service
    // ...
    it('should announce a mission', () => {
      const missionControl = element(by.tagName('app-mission-control'));
      const announceButton = missionControl.all(by.tagName('button')).get(0);
      announceButton.click().then(() => {
        const history = missionControl.all(by.tagName('li'));
        expect(history.count()).toBe(1);
        expect(history.get(0).getText()).toMatch(/Mission.* announced/);
      });
    });

    it('should confirm the mission by Lovell', () => {
      testConfirmMission(1, 2, 'Lovell');
    });

    it('should confirm the mission by Haise', () => {
      testConfirmMission(3, 3, 'Haise');
    });

    it('should confirm the mission by Swigert', () => {
      testConfirmMission(2, 4, 'Swigert');
    });

    function testConfirmMission(buttonIndex: number, expectedLogCount: number, astronaut: string) {
      const confirmedLog = ' confirmed the mission';
      const missionControl = element(by.tagName('app-mission-control'));
      const confirmButton = missionControl.all(by.tagName('button')).get(buttonIndex);
      confirmButton.click().then(() => {
        const history = missionControl.all(by.tagName('li'));
        expect(history.count()).toBe(expectedLogCount);
        expect(history.get(expectedLogCount - 1).getText()).toBe(astronaut + confirmedLog);
      });
    }
    // ...
    // #enddocregion bidirectional-service
  });

});
