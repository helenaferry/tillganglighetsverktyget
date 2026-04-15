const contentTypeTexts = [
  {
    contentType: 'Bilder, ikoner & grafik',
    question: 'Innehåller {{theObjectType}} bilder, ikoner eller grafik?',
    prefillComment:
      'Kravet har förifyllts som irrelevant eftersom {{theObjectType}}, enligt tidigare ifyllda uppgifter, saknar bilder, ikoner och grafik.',
  },
  {
    contentType: 'Formulär & inmatningsfält',
    question: 'Innehåller {{theObjectType}} formulär eller inmatningsfält?',
    prefillComment:
      'Kravet har förifyllts som irrelevant eftersom {{theObjectType}}, enligt tidigare ifyllda uppgifter, saknar formulär och inmatningsfält.',
  },
  {
    contentType: 'Mediaspelare Ljud',
    question: 'Innehåller {{theObjectType}} ljud?',
    prefillComment:
      'Kravet har förifyllts som irrelevant eftersom {{theObjectType}}, enligt tidigare ifyllda uppgifter, saknar ljud.',
  },
  {
    contentType: 'Mediaspelare Video',
    question: 'Innehåller {{theObjectType}} video eller filmer?',
    prefillComment:
      'Kravet har förifyllts som irrelevant eftersom {{theObjectType}}, enligt tidigare ifyllda uppgifter, saknar video.',
  },
  {
    contentType: 'Videosamtal',
    question: 'Innehåller {{theObjectType}} röst-/videokommunikation?',
    prefillComment:
      'Kravet har förifyllts som irrelevant eftersom {{theObjectType}}, enligt tidigare ifyllda uppgifter, saknar röst-/videokommunikation.',
  },
  {
    contentType: 'Innehållsskapande',
    question:
      'Innehåller {{theObjectType}} möjlighet att publicera innehåll eller lämna kommentar?',
    prefillComment:
      'Kravet har förifyllts som irrelevant eftersom {{theObjectType}}, enligt tidigare ifyllda uppgifter, saknar möjlighet att publicera innehåll eller lämna kommentar.',
  },
];

export default contentTypeTexts;
