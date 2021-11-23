import {
  LegalStatusOptions,
  MaritalStatusOptions,
  ResultOptions,
  ResultReasons,
} from '../types';
import { mockedRequestFactory } from './factory';

describe('sanity checks', () => {
  it('fails on age over 150', async () => {
    const { res } = await mockedRequestFactory({ age: 151 });
    expect(res.status).toEqual(400);
    expect(res.body.error).toEqual(ResultOptions.INVALID);
  });
  it('accepts age equal to 150', async () => {
    const { res } = await mockedRequestFactory({ age: 150 });
    expect(res.status).toEqual(200);
  });
  it('accepts valid Marital Status', async () => {
    const { res } = await mockedRequestFactory({
      age: 65,
      maritalStatus: MaritalStatusOptions.SINGLE,
    });
    expect(res.status).toEqual(200);
  });
  it('accepts valid Legal Status', async () => {
    const { res } = await mockedRequestFactory({
      age: 65,
      legalStatus: LegalStatusOptions.CANADIAN_CITIZEN,
    });
    expect(res.status).toEqual(200);
  });
  it('fails when years in Canada is greater than age minus 18', async () => {
    const { res } = await mockedRequestFactory({
      age: 65,
      yearsInCanadaSince18: 48,
    });
    expect(res.status).toEqual(400);
    expect(res.body.error).toEqual(ResultOptions.INVALID);
  });
  it('accepts when years in Canada is equal to age minus 18', async () => {
    const { res } = await mockedRequestFactory({
      age: 65,
      yearsInCanadaSince18: 47,
    });
    expect(res.status).toEqual(200);
  });
  it('fails when not partnered and "partnerReceivingOas" true', async () => {
    let { res } = await mockedRequestFactory({
      age: 65,
      maritalStatus: MaritalStatusOptions.SINGLE,
      partnerReceivingOas: true,
    });
    expect(res.status).toEqual(400);
    expect(res.body.error).toEqual(ResultOptions.INVALID);
  });
  it('accepts when not partnered and "partnerReceivingOas" false', async () => {
    let { res } = await mockedRequestFactory({
      age: 65,
      maritalStatus: MaritalStatusOptions.SINGLE,
      partnerReceivingOas: false,
    });
    expect(res.status).toEqual(200);
  });
  it('accepts when partnered and "partnerReceivingOas" present', async () => {
    const { res } = await mockedRequestFactory({
      age: 65,
      maritalStatus: MaritalStatusOptions.MARRIED,
      partnerReceivingOas: true,
    });
    expect(res.status).toEqual(200);
  });
});

describe('field requirement analysis', () => {
  it('requires 4 OAS and 2 GIS fields when nothing provided', async () => {
    const { res } = await mockedRequestFactory({});
    expect(res.body.oas.result).toEqual(ResultOptions.MORE_INFO);
    expect(res.body.oas.reason).toEqual(ResultReasons.MORE_INFO);
    expect(res.body.oas.missingFields.toString()).toEqual(
      ['age', 'livingCountry', 'legalStatus', 'yearsInCanadaSince18'].toString()
    );
    expect(res.body.gis.result).toEqual(ResultOptions.MORE_INFO);
    expect(res.body.gis.reason).toEqual(ResultReasons.MORE_INFO);
    expect(res.body.gis.missingFields.toString()).toEqual(
      ['maritalStatus', 'income'].toString()
    );
    expect(res.body.allFields.toString()).toEqual(
      [
        'age',
        'livingCountry',
        'legalStatus',
        'yearsInCanadaSince18',
        'maritalStatus',
        'income',
      ].toString()
    );
  });
  it('requires 3 OAS and 2 GIS fields when only age 65 provided', async () => {
    const { res } = await mockedRequestFactory({ age: 65 });
    expect(res.body.oas.result).toEqual(ResultOptions.MORE_INFO);
    expect(res.body.oas.reason).toEqual(ResultReasons.MORE_INFO);
    expect(res.body.oas.missingFields.toString()).toEqual(
      ['livingCountry', 'legalStatus', 'yearsInCanadaSince18'].toString()
    );
    expect(res.body.gis.result).toEqual(ResultOptions.MORE_INFO);
    expect(res.body.gis.reason).toEqual(ResultReasons.MORE_INFO);
    expect(res.body.gis.missingFields.toString()).toEqual(
      ['maritalStatus', 'income'].toString()
    );
    expect(res.body.allFields.toString()).toEqual(
      [
        'age',
        'livingCountry',
        'legalStatus',
        'yearsInCanadaSince18',
        'maritalStatus',
        'income',
      ].toString()
    );
  });
  it('requires 3 OAS and 2 GIS fields when only age 64 provided', async () => {
    const { res } = await mockedRequestFactory({ age: 64 });
    expect(res.body.oas.result).toEqual(ResultOptions.MORE_INFO);
    expect(res.body.oas.reason).toEqual(ResultReasons.MORE_INFO);
    expect(res.body.oas.missingFields.toString()).toEqual(
      ['livingCountry', 'legalStatus', 'yearsInCanadaSince18'].toString()
    );
    expect(res.body.gis.result).toEqual(ResultOptions.MORE_INFO);
    expect(res.body.gis.reason).toEqual(ResultReasons.MORE_INFO);
    expect(res.body.gis.missingFields.toString()).toEqual(
      ['maritalStatus', 'income'].toString()
    );
    expect(res.body.allFields.toString()).toEqual(
      [
        'age',
        'livingCountry',
        'legalStatus',
        'yearsInCanadaSince18',
        'maritalStatus',
        'income',
      ].toString()
    );
  });
  it('requires 2 OAS and 2 GIS fields when only age/country provided', async () => {
    const { res } = await mockedRequestFactory({
      age: 65,
      livingCountry: 'Canada',
    });
    expect(res.body.oas.result).toEqual(ResultOptions.MORE_INFO);
    expect(res.body.oas.reason).toEqual(ResultReasons.MORE_INFO);
    expect(res.body.oas.missingFields.toString()).toEqual(
      ['legalStatus', 'yearsInCanadaSince18'].toString()
    );
    expect(res.body.gis.result).toEqual(ResultOptions.MORE_INFO);
    expect(res.body.gis.reason).toEqual(ResultReasons.MORE_INFO);
    expect(res.body.gis.missingFields.toString()).toEqual(
      ['maritalStatus', 'income'].toString()
    );
    expect(res.body.allFields.toString()).toEqual(
      [
        'age',
        'livingCountry',
        'legalStatus',
        'yearsInCanadaSince18',
        'maritalStatus',
        'income',
      ].toString()
    );
  });
  it('requires 1 OAS and 2 GIS fields when only age/country/legal provided', async () => {
    const { res } = await mockedRequestFactory({
      age: 65,
      livingCountry: 'Canada',
      legalStatus: LegalStatusOptions.CANADIAN_CITIZEN,
    });
    expect(res.body.oas.result).toEqual(ResultOptions.MORE_INFO);
    expect(res.body.oas.reason).toEqual(ResultReasons.MORE_INFO);
    expect(res.body.oas.missingFields.toString()).toEqual(
      ['yearsInCanadaSince18'].toString()
    );
    expect(res.body.gis.result).toEqual(ResultOptions.MORE_INFO);
    expect(res.body.gis.reason).toEqual(ResultReasons.MORE_INFO);
    expect(res.body.gis.missingFields.toString()).toEqual(
      ['maritalStatus', 'income'].toString()
    );
    expect(res.body.allFields.toString()).toEqual(
      [
        'age',
        'livingCountry',
        'legalStatus',
        'yearsInCanadaSince18',
        'maritalStatus',
        'income',
      ].toString()
    );
  });
  it('requires 0 OAS and 2 GIS fields when only age/country/legal/years provided', async () => {
    const { res } = await mockedRequestFactory({
      age: 65,
      livingCountry: 'Canada',
      legalStatus: LegalStatusOptions.CANADIAN_CITIZEN,
      yearsInCanadaSince18: 20,
    });
    expect(res.body.oas.result).toEqual(ResultOptions.ELIGIBLE);
    expect(res.body.oas.reason).toEqual(ResultReasons.NONE);
    expect(res.body.oas.missingFields).toBeUndefined();
    expect(res.body.gis.result).toEqual(ResultOptions.MORE_INFO);
    expect(res.body.gis.reason).toEqual(ResultReasons.MORE_INFO);
    expect(res.body.gis.missingFields.toString()).toEqual(
      ['maritalStatus', 'income'].toString()
    );
    expect(res.body.allFields.toString()).toEqual(
      [
        'age',
        'livingCountry',
        'legalStatus',
        'yearsInCanadaSince18',
        'maritalStatus',
        'income',
      ].toString()
    );
  });
  it('requires 0 OAS and 1 GIS fields when only age/country/legal/years/marital=single provided', async () => {
    const { res } = await mockedRequestFactory({
      age: 65,
      livingCountry: 'Canada',
      legalStatus: LegalStatusOptions.CANADIAN_CITIZEN,
      yearsInCanadaSince18: 20,
      maritalStatus: MaritalStatusOptions.SINGLE,
    });
    expect(res.body.oas.result).toEqual(ResultOptions.ELIGIBLE);
    expect(res.body.oas.reason).toEqual(ResultReasons.NONE);
    expect(res.body.oas.missingFields).toBeUndefined();
    expect(res.body.gis.result).toEqual(ResultOptions.MORE_INFO);
    expect(res.body.gis.reason).toEqual(ResultReasons.MORE_INFO);
    expect(res.body.gis.missingFields.toString()).toEqual(
      ['income'].toString()
    );
    expect(res.body.allFields.toString()).toEqual(
      [
        'age',
        'livingCountry',
        'legalStatus',
        'yearsInCanadaSince18',
        'maritalStatus',
        'income',
      ].toString()
    );
  });
  it('requires 0 OAS and 2 GIS fields when only age/country/legal/years/marital=married provided', async () => {
    const { res } = await mockedRequestFactory({
      age: 65,
      livingCountry: 'Canada',
      legalStatus: LegalStatusOptions.CANADIAN_CITIZEN,
      yearsInCanadaSince18: 20,
      maritalStatus: MaritalStatusOptions.MARRIED,
    });
    expect(res.body.oas.result).toEqual(ResultOptions.ELIGIBLE);
    expect(res.body.oas.reason).toEqual(ResultReasons.NONE);
    expect(res.body.oas.missingFields).toBeUndefined();
    expect(res.body.gis.result).toEqual(ResultOptions.MORE_INFO);
    expect(res.body.gis.reason).toEqual(ResultReasons.MORE_INFO);
    expect(res.body.gis.missingFields.toString()).toEqual(
      ['partnerReceivingOas', 'income'].toString()
    );
    expect(res.body.allFields.toString()).toEqual(
      [
        'age',
        'livingCountry',
        'legalStatus',
        'yearsInCanadaSince18',
        'maritalStatus',
        'partnerReceivingOas',
        'income',
      ].toString()
    );
  });
  it('requires 0 OAS and 1 GIS fields when only age/country/legal/years/marital/partner provided', async () => {
    const { res } = await mockedRequestFactory({
      age: 65,
      livingCountry: 'Canada',
      legalStatus: LegalStatusOptions.CANADIAN_CITIZEN,
      yearsInCanadaSince18: 20,
      maritalStatus: MaritalStatusOptions.MARRIED,
      partnerReceivingOas: true,
    });
    expect(res.body.oas.result).toEqual(ResultOptions.ELIGIBLE);
    expect(res.body.oas.reason).toEqual(ResultReasons.NONE);
    expect(res.body.oas.missingFields).toBeUndefined();
    expect(res.body.gis.result).toEqual(ResultOptions.MORE_INFO);
    expect(res.body.gis.reason).toEqual(ResultReasons.MORE_INFO);
    expect(res.body.gis.missingFields.toString()).toEqual(
      ['income'].toString()
    );
    expect(res.body.allFields.toString()).toEqual(
      [
        'age',
        'livingCountry',
        'legalStatus',
        'yearsInCanadaSince18',
        'maritalStatus',
        'partnerReceivingOas',
        'income',
      ].toString()
    );
  });
});

describe('basic OAS scenarios', () => {
  it('returns "ineligible" when not citizen', async () => {
    const { res } = await mockedRequestFactory({
      age: 65,
      livingCountry: 'Canada',
      legalStatus: LegalStatusOptions.NONE,
      yearsInCanadaSince18: 20,
    });
    expect(res.body.oas.result).toEqual(ResultOptions.INELIGIBLE);
    expect(res.body.oas.reason).toEqual(ResultReasons.CITIZEN);
  });
  it('returns "ineligible" when citizen and under 10 years in Canada', async () => {
    const { res } = await mockedRequestFactory({
      age: 65,
      livingCountry: 'Canada',
      legalStatus: LegalStatusOptions.CANADIAN_CITIZEN,
      yearsInCanadaSince18: 9,
    });
    expect(res.body.oas.result).toEqual(ResultOptions.INELIGIBLE);
    expect(res.body.oas.reason).toEqual(ResultReasons.YEARS_IN_CANADA);
  });
  it('returns "eligible" when citizen and 10 years in Canada', async () => {
    const { res } = await mockedRequestFactory({
      age: 65,
      livingCountry: 'Canada',
      legalStatus: LegalStatusOptions.CANADIAN_CITIZEN,
      yearsInCanadaSince18: 10,
    });
    expect(res.body.oas.result).toEqual(ResultOptions.ELIGIBLE);
    expect(res.body.oas.reason).toEqual(ResultReasons.NONE);
  });
  it('returns "eligible" when living in Agreement and 20 years in Canada', async () => {
    const { res } = await mockedRequestFactory({
      age: 65,
      livingCountry: 'Agreement',
      legalStatus: LegalStatusOptions.CANADIAN_CITIZEN,
      yearsInCanadaSince18: 20,
    });
    expect(res.body.oas.result).toEqual(ResultOptions.ELIGIBLE);
    expect(res.body.oas.reason).toEqual(ResultReasons.NONE);
  });
  it('returns "conditionally eligible" when living in Agreement and under 20 years in Canada', async () => {
    const { res } = await mockedRequestFactory({
      age: 65,
      livingCountry: 'Agreement',
      legalStatus: LegalStatusOptions.CANADIAN_CITIZEN,
      yearsInCanadaSince18: 19,
    });
    expect(res.body.oas.result).toEqual(ResultOptions.CONDITIONAL);
    expect(res.body.oas.reason).toEqual(ResultReasons.YEARS_IN_CANADA);
  });
  it('returns "eligible" when living in No Agreement and 20 years in Canada', async () => {
    const { res } = await mockedRequestFactory({
      age: 65,
      livingCountry: 'No Agreement',
      legalStatus: LegalStatusOptions.CANADIAN_CITIZEN,
      yearsInCanadaSince18: 20,
    });
    expect(res.body.oas.result).toEqual(ResultOptions.ELIGIBLE);
    expect(res.body.oas.reason).toEqual(ResultReasons.NONE);
  });
  it('returns "ineligible" when living in No Agreement and under 20 years in Canada', async () => {
    const { res } = await mockedRequestFactory({
      age: 65,
      livingCountry: 'No Agreement',
      legalStatus: LegalStatusOptions.CANADIAN_CITIZEN,
      yearsInCanadaSince18: 19,
    });
    expect(res.body.oas.result).toEqual(ResultOptions.INELIGIBLE);
    expect(res.body.oas.reason).toEqual(ResultReasons.YEARS_IN_CANADA);
  });
  it('returns "eligible when 65" when age 55 and citizen and 20 years in Canada', async () => {
    const { res } = await mockedRequestFactory({
      age: 55,
      livingCountry: 'Canada',
      legalStatus: LegalStatusOptions.CANADIAN_CITIZEN,
      yearsInCanadaSince18: 20,
    });
    expect(res.body.oas.result).toEqual(ResultOptions.ELIGIBLE_WHEN_65);
    expect(res.body.oas.reason).toEqual(ResultReasons.AGE);
  });
});

describe('basic GIS scenarios', () => {
  it('returns "needs more info" when missing marital status', async () => {
    const { res } = await mockedRequestFactory({
      age: 65,
      legalStatus: LegalStatusOptions.CANADIAN_CITIZEN,
      yearsInCanadaSince18: 20,
    });
    expect(res.body.gis.result).toEqual(ResultOptions.MORE_INFO);
    expect(res.body.gis.reason).toEqual(ResultReasons.MORE_INFO);
  });
  it('returns "needs more info" when missing income', async () => {
    const { res } = await mockedRequestFactory({
      age: 65,
      legalStatus: LegalStatusOptions.CANADIAN_CITIZEN,
      yearsInCanadaSince18: 20,
      maritalStatus: MaritalStatusOptions.SINGLE,
    });
    expect(res.body.gis.result).toEqual(ResultOptions.MORE_INFO);
    expect(res.body.gis.reason).toEqual(ResultReasons.MORE_INFO);
  });
  it('returns "needs more info" when partnered and "partnerReceivingOas" missing', async () => {
    let { res } = await mockedRequestFactory({
      age: 65,
      maritalStatus: MaritalStatusOptions.MARRIED,
      partnerReceivingOas: undefined,
    });
    expect(res.body.gis.result).toEqual(ResultOptions.MORE_INFO);
    expect(res.body.gis.reason).toEqual(ResultReasons.MORE_INFO);
  });
  it('returns "not eligible" when single and income over 18216', async () => {
    const { res } = await mockedRequestFactory({
      age: 65,
      livingCountry: 'Canada',
      legalStatus: LegalStatusOptions.CANADIAN_CITIZEN,
      yearsInCanadaSince18: 20,
      maritalStatus: MaritalStatusOptions.SINGLE,
      income: 18217,
    });
    expect(res.body.gis.result).toEqual(ResultOptions.INELIGIBLE);
    expect(res.body.gis.reason).toEqual(ResultReasons.INCOME);
  });
  it('returns "eligible" when single and income under 18216', async () => {
    const { res } = await mockedRequestFactory({
      age: 65,
      livingCountry: 'Canada',
      legalStatus: LegalStatusOptions.CANADIAN_CITIZEN,
      yearsInCanadaSince18: 20,
      maritalStatus: MaritalStatusOptions.SINGLE,
      income: 18216,
    });
    expect(res.body.gis.result).toEqual(ResultOptions.ELIGIBLE);
    expect(res.body.gis.reason).toEqual(ResultReasons.NONE);
  });
  it('returns "not eligible" when married and no partner OAS and income over 43680', async () => {
    const { res } = await mockedRequestFactory({
      age: 65,
      livingCountry: 'Canada',
      legalStatus: LegalStatusOptions.CANADIAN_CITIZEN,
      yearsInCanadaSince18: 20,
      maritalStatus: MaritalStatusOptions.MARRIED,
      partnerReceivingOas: false,
      income: 43681,
    });
    expect(res.body.gis.result).toEqual(ResultOptions.INELIGIBLE);
    expect(res.body.gis.reason).toEqual(ResultReasons.INCOME);
  });
  it('returns "eligible" when married and no partner OAS and income under 43680', async () => {
    const { res } = await mockedRequestFactory({
      age: 65,
      livingCountry: 'Canada',
      legalStatus: LegalStatusOptions.CANADIAN_CITIZEN,
      yearsInCanadaSince18: 20,
      maritalStatus: MaritalStatusOptions.MARRIED,
      partnerReceivingOas: false,
      income: 43680,
    });
    expect(res.body.gis.result).toEqual(ResultOptions.ELIGIBLE);
    expect(res.body.gis.reason).toEqual(ResultReasons.NONE);
  });
  it('returns "not eligible" when married and partner OAS and income over 24048', async () => {
    const { res } = await mockedRequestFactory({
      age: 65,
      livingCountry: 'Canada',
      legalStatus: LegalStatusOptions.CANADIAN_CITIZEN,
      yearsInCanadaSince18: 20,
      maritalStatus: MaritalStatusOptions.MARRIED,
      partnerReceivingOas: true,
      income: 24049,
    });
    expect(res.body.gis.result).toEqual(ResultOptions.INELIGIBLE);
    expect(res.body.gis.reason).toEqual(ResultReasons.INCOME);
  });
  it('returns "eligible" when married and partner OAS and income under 24048', async () => {
    const { res } = await mockedRequestFactory({
      age: 65,
      livingCountry: 'Canada',
      legalStatus: LegalStatusOptions.CANADIAN_CITIZEN,
      yearsInCanadaSince18: 20,
      maritalStatus: MaritalStatusOptions.MARRIED,
      partnerReceivingOas: true,
      income: 24048,
    });
    expect(res.body.gis.result).toEqual(ResultOptions.ELIGIBLE);
    expect(res.body.gis.reason).toEqual(ResultReasons.NONE);
  });
});

describe('thorough personas', () => {
  it('Tanu Singh: OAS eligible, GIS eligible', async () => {
    const { res } = await mockedRequestFactory({
      age: 65,
      livingCountry: 'Canada',
      legalStatus: LegalStatusOptions.CANADIAN_CITIZEN,
      yearsInCanadaSince18: 47,
      maritalStatus: MaritalStatusOptions.MARRIED,
      partnerReceivingOas: true,
      income: 17000,
    });
    expect(res.body.oas.result).toEqual(ResultOptions.ELIGIBLE);
    expect(res.body.oas.reason).toEqual(ResultReasons.NONE);
    expect(res.body.gis.result).toEqual(ResultOptions.ELIGIBLE);
    expect(res.body.gis.reason).toEqual(ResultReasons.NONE);
  });
  it('Habon Aden: OAS conditionally eligible, GIS ineligible due to income', async () => {
    const { res } = await mockedRequestFactory({
      age: 66,
      livingCountry: 'Jamaica',
      legalStatus: LegalStatusOptions.CANADIAN_CITIZEN,
      yearsInCanadaSince18: 18,
      maritalStatus: MaritalStatusOptions.SINGLE,
      partnerReceivingOas: undefined,
      income: 28000,
    });
    expect(res.body.oas.result).toEqual(ResultOptions.CONDITIONAL);
    expect(res.body.oas.reason).toEqual(ResultReasons.YEARS_IN_CANADA);
    expect(res.body.gis.result).toEqual(ResultOptions.INELIGIBLE);
    expect(res.body.gis.reason).toEqual(ResultReasons.INCOME);
  });
  it('Miriam Krayem: OAS eligible when 65, GIS ineligible due to income', async () => {
    const { res } = await mockedRequestFactory({
      age: 55,
      livingCountry: 'Canada',
      legalStatus: LegalStatusOptions.CANADIAN_CITIZEN,
      yearsInCanadaSince18: 30,
      maritalStatus: MaritalStatusOptions.DIVORCED,
      partnerReceivingOas: undefined,
      income: 40000,
    });
    expect(res.body.oas.result).toEqual(ResultOptions.ELIGIBLE_WHEN_65);
    expect(res.body.oas.reason).toEqual(ResultReasons.AGE);
    expect(res.body.gis.result).toEqual(ResultOptions.INELIGIBLE);
    expect(res.body.gis.reason).toEqual(ResultReasons.INCOME);
  });
  it('Adam Smith: OAS eligible when 65, GIS ineligible due to income', async () => {
    const { res } = await mockedRequestFactory({
      age: 62,
      livingCountry: 'Canada',
      legalStatus: LegalStatusOptions.PERMANENT_RESIDENT,
      yearsInCanadaSince18: 15,
      maritalStatus: MaritalStatusOptions.WIDOWED,
      partnerReceivingOas: undefined,
      income: 25000,
    });
    expect(res.body.oas.result).toEqual(ResultOptions.ELIGIBLE_WHEN_65);
    expect(res.body.oas.reason).toEqual(ResultReasons.AGE);
    expect(res.body.gis.result).toEqual(ResultOptions.INELIGIBLE);
    expect(res.body.gis.reason).toEqual(ResultReasons.INCOME);
  });
});

describe('thorough extras', () => {
  it('returns "ineligible due to years in Canada" when living in Canada and 9 years in Canada', async () => {
    const { res } = await mockedRequestFactory({
      age: 65,
      livingCountry: 'Canada',
      legalStatus: LegalStatusOptions.CANADIAN_CITIZEN,
      yearsInCanadaSince18: 9,
      maritalStatus: MaritalStatusOptions.SINGLE,
      partnerReceivingOas: undefined,
      income: undefined,
    });
    expect(res.body.oas.result).toEqual(ResultOptions.INELIGIBLE);
    expect(res.body.oas.reason).toEqual(ResultReasons.YEARS_IN_CANADA);
    expect(res.body.gis.result).toEqual(ResultOptions.INELIGIBLE);
    expect(res.body.gis.reason).toEqual(ResultReasons.OAS);
  });
  it('returns "conditionally eligible" when living in Agreement and 9 years in Canada', async () => {
    const { res } = await mockedRequestFactory({
      age: 65,
      livingCountry: 'Agreement',
      legalStatus: LegalStatusOptions.CANADIAN_CITIZEN,
      yearsInCanadaSince18: 9,
      maritalStatus: MaritalStatusOptions.SINGLE,
      partnerReceivingOas: undefined,
      income: undefined,
    });
    expect(res.body.oas.result).toEqual(ResultOptions.CONDITIONAL);
    expect(res.body.oas.reason).toEqual(ResultReasons.YEARS_IN_CANADA);
    expect(res.body.gis.result).toEqual(ResultOptions.MORE_INFO);
    expect(res.body.gis.reason).toEqual(ResultReasons.MORE_INFO);
  });
  it('returns "eligible" when living in Canada and 10 years in Canada', async () => {
    const { res } = await mockedRequestFactory({
      age: 65,
      livingCountry: 'Canada',
      legalStatus: LegalStatusOptions.CANADIAN_CITIZEN,
      yearsInCanadaSince18: 10,
      maritalStatus: MaritalStatusOptions.SINGLE,
      partnerReceivingOas: undefined,
      income: 10000,
    });
    expect(res.body.oas.result).toEqual(ResultOptions.ELIGIBLE);
    expect(res.body.oas.reason).toEqual(ResultReasons.NONE);
    expect(res.body.gis.result).toEqual(ResultOptions.ELIGIBLE);
    expect(res.body.gis.reason).toEqual(ResultReasons.NONE);
  });
  it('returns "ineligible due to years in Canada" when not living in Canada and 19 years in Canada', async () => {
    const { res } = await mockedRequestFactory({
      age: 65,
      livingCountry: 'Not Canada',
      legalStatus: LegalStatusOptions.CANADIAN_CITIZEN,
      yearsInCanadaSince18: 19,
      maritalStatus: MaritalStatusOptions.SINGLE,
      partnerReceivingOas: undefined,
      income: 10000,
    });
    expect(res.body.oas.result).toEqual(ResultOptions.INELIGIBLE);
    expect(res.body.oas.reason).toEqual(ResultReasons.YEARS_IN_CANADA);
    expect(res.body.gis.result).toEqual(ResultOptions.INELIGIBLE);
    expect(res.body.gis.reason).toEqual(ResultReasons.OAS);
  });
  it('returns "eligible" when not living in Canada and 20 years in Canada', async () => {
    const { res } = await mockedRequestFactory({
      age: 65,
      livingCountry: 'Not Canada',
      legalStatus: LegalStatusOptions.CANADIAN_CITIZEN,
      yearsInCanadaSince18: 20,
      maritalStatus: MaritalStatusOptions.SINGLE,
      partnerReceivingOas: undefined,
      income: 15000,
    });
    expect(res.body.oas.result).toEqual(ResultOptions.ELIGIBLE);
    expect(res.body.oas.reason).toEqual(ResultReasons.NONE);
    expect(res.body.gis.result).toEqual(ResultOptions.ELIGIBLE);
    expect(res.body.gis.reason).toEqual(ResultReasons.NONE);
  });
});
