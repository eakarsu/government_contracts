import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import NativeRuntimeAI from './NativeRuntimeAI';
import NativeAIReport from './NativeAIReport';
import { fillNativeFields } from './NativeAIControls';
import Login from '../pages/Login';
import SearchResults from './search/SearchResults';
import contractService from '../services/contractService';
import formService from '../services/formService';
import Applications from '../pages/Applications';
import SavedSearches from '../pages/SavedSearches';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

jest.mock('../services/api', () => ({ get: jest.fn() }));
jest.mock('../context/AuthContext', () => ({ useAuth: jest.fn() }));
global.IS_REACT_ACT_ENVIRONMENT = true;

const config = {
  title: 'Fixture review', endpoint: '/runtime-ai/fixture', description: 'Fixture',
  fields: [
    { key: 'prompt', label: 'Brief', required: true, examples: ['Quick evidence review', 'Team plan', 'Detailed risk review'] },
    { key: 'context', label: 'Context', required: false, examples: ['Small contract', 'Multi-team procurement', 'Federal review with dependencies'] },
  ],
};

let root;
let container;
beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  api.get.mockReset();
  api.get.mockResolvedValue({ data: [] });
});
afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

test('every preset fills required and optional inputs without invoking generation', async () => {
  const request = jest.fn();
  await act(async () => root.render(<NativeRuntimeAI config={config} request={request} />));
  const values = [];
  for (const name of ['Quick brief', 'Team planning', 'Detailed review']) {
    const button = [...container.querySelectorAll('button')].find(item => item.textContent === name);
    await act(async () => button.click());
    values.push([...container.querySelectorAll('textarea')].map(item => item.value));
  }
  expect(values).toEqual([
    ['Quick evidence review', 'Small contract'],
    ['Team plan', 'Multi-team procurement'],
    ['Detailed risk review', 'Federal review with dependencies'],
  ]);
  expect(request).not.toHaveBeenCalled();
});

test('generic preset keeps real record selections and uploads explicit', () => {
  const scope = document.createElement('div');
  scope.innerHTML = '<select name="contractId"><option value="">Select</option><option value="real-record">Existing contract</option></select><input name="attachment" type="file"><input name="record_id" required><textarea name="notes"></textarea>';
  scope.querySelector('select').value = 'real-record';
  const result = fillNativeFields(scope, 1, 'contract review');
  expect(scope.querySelector('select').value).toBe('real-record');
  expect(scope.querySelector('input[type="file"]').files).toHaveLength(0);
  expect(scope.querySelector('input[name="record_id"]').value).toBe('');
  expect(scope.querySelector('textarea').value).not.toBe('');
  expect(result.manual.length).toBeGreaterThanOrEqual(2);
});

test('returned structured values are readable and preserve false, zero, and empty text', () => {
  const html = renderToStaticMarkup(<NativeAIReport response={{ content: JSON.stringify({
    compliance: { approved: false, missing_count: 0, note: '' },
    actions: [{ owner: 'Reviewer', done: false }, { owner: 'Manager', done: true }],
  }) }} />);
  expect(html).toContain('Compliance');
  expect(html).toContain('Missing count');
  expect(html).toContain('No');
  expect(html).toContain('0');
  expect(html).toContain('&quot;&quot;');
  expect(html).toContain('<table');
  expect(html).not.toContain('{&quot;compliance&quot;');
});

test('saved history opens a structured detail view', async () => {
  const saved = { id: '7f995f64-654b-43dd-8f8e-31529933ab45', prompt: 'Review evidence', content: '{"risk":{"approved":false,"count":0}}', created_at: '2026-10-10T12:00:00Z', model: 'fixture' };
  api.get.mockImplementation(path => Promise.resolve({ data: path.endsWith('/history') ? [saved] : saved }));
  await act(async () => root.render(<NativeRuntimeAI config={config} request={jest.fn()} />));
  const row = container.querySelector('.ai-history-row');
  expect(row).not.toBeNull();
  await act(async () => row.click());
  expect(container.textContent).toContain('Saved AI report');
  expect(container.textContent).toContain('Approved');
  expect(container.textContent).toContain('No');
  expect(container.textContent).toContain('0');
});

test('demo login button invokes the configured login action without submitting the form', async () => {
  const loginDemo = jest.fn().mockResolvedValue({ success: true });
  const login = jest.fn();
  useAuth.mockReturnValue({ login, loginDemo });
  await act(async () => root.render(<MemoryRouter><Login /></MemoryRouter>));
  let submissions = 0;
  container.querySelector('form').addEventListener('submit', event => { event.preventDefault(); submissions++; });
  const button = [...container.querySelectorAll('button')].find(item => item.textContent === 'Log In as Demo');
  await act(async () => button.click());
  expect(loginDemo).toHaveBeenCalledTimes(1);
  expect(login).not.toHaveBeenCalled();
  expect(submissions).toBe(0);
});

test('contract search renders 15 real API-shaped fixture records without a render error', async () => {
  const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
  const contracts = Array.from({ length: 15 }, (_, index) => ({
    _id: `fixture-contract-${index + 1}`,
    noticeId: `NOTICE-${index + 1}`,
    title: `Contract opportunity ${index + 1}`,
    department: 'Department of Agriculture',
    description: 'Agency procurement opportunity',
    responseDeadline: '2026-12-01T00:00:00Z',
  }));
  await act(async () => root.render(<MemoryRouter><SearchResults results={{ contracts, totalCount: 15 }} /></MemoryRouter>));
  expect(container.querySelectorAll('a[href^="/contract/"]')).toHaveLength(30);
  expect(container.textContent).toContain('Contract opportunity 15');
  expect(container.textContent).toContain('Department of Agriculture');
  expect(consoleError).not.toHaveBeenCalled();
  consoleError.mockRestore();
});

test('list services extract API arrays and guard malformed payloads', async () => {
  api.get.mockImplementation(path => Promise.resolve({ data: path === '/contracts'
    ? { contracts: [{ _id: 'contract-1' }], totalCount: 1 }
    : path === '/forms/applications' ? { applications: [{ id: 'application-1' }] } : [] }));
  expect((await contractService.listContracts()).contracts).toHaveLength(1);
  expect(await formService.getApplications()).toHaveLength(1);
  expect(await contractService.getSavedSearches()).toEqual([]);
  api.get.mockResolvedValue({ data: { data: 'not an array' } });
  expect((await contractService.listContracts()).contracts).toEqual([]);
  expect(await formService.getApplications()).toEqual([]);
  expect(await contractService.getSavedSearches()).toEqual([]);
});

test('applications and saved searches render 15 API-shaped fixture cards each', async () => {
  const applications = Array.from({ length: 15 }, (_, index) => ({
    id: `application-${index + 1}`, contractId: `contract-${index + 1}`,
    contractTitle: `Application contract ${index + 1}`, agency: 'Department of Agriculture',
    status: 'draft', deadline: '2026-12-01T00:00:00Z', documents: []
  }));
  const searches = Array.from({ length: 15 }, (_, index) => ({
    _id: `search-${index + 1}`, name: `Saved opportunity search ${index + 1}`,
    createdAt: '2026-10-01T00:00:00Z', query: { keywords: 'procurement' },
    alertEnabled: false
  }));
  api.get.mockImplementation(path => Promise.resolve({ data: path === '/forms/applications'
    ? { applications } : path === '/contracts/searches' ? searches : [] }));
  const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  await act(async () => root.render(<MemoryRouter><QueryClientProvider client={client}>
    <Applications /><SavedSearches />
  </QueryClientProvider></MemoryRouter>));
  expect(container.querySelectorAll('a[href^="/contract/"]')).toHaveLength(15);
  expect(container.textContent).toContain('Application contract 15');
  expect(container.querySelectorAll('h3')).toHaveLength(15);
  expect(container.textContent).toContain('Saved opportunity search 15');
  expect(consoleError).not.toHaveBeenCalled();
  consoleError.mockRestore();
});
