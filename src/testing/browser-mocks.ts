export function mockWindowOpen(): jasmine.Spy {
  return spyOn(window, 'open').and.returnValue({
    document: { title: '', body: { innerText: '' } },
    location: { href: '' },
    close: () => undefined,
  } as unknown as Window);
}
