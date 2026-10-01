// AP history courses: one lesson per College Board unit (or period), plus an exam guide.
// Plain text only in these files: a dollar sign starts KaTeX math, so write "dollars" instead.
import { rule, table, tip } from './lesson-kit.js';

// Shared exam guide for the three survey history courses (APUSH, World, Euro), which use the same exam format.
const historyExamLesson = (course) => ({
  id: 'exam',
  title: `The ${course} exam: format and scoring`,
  mins: 7,
  body: `
<p>The ${course} exam is 3 hours 15 minutes and has four parts:</p>
${table(['Part', 'Questions', 'Time', 'Weight'], [
  ['Multiple choice', '55, in sets of 3 or 4 tied to a source', '55 min', '40%'],
  ['Short answer (SAQ)', '3 (questions 1 and 2, then a choice of 3 or 4)', '40 min', '20%'],
  ['Document-based question (DBQ)', '1 essay with 7 documents', '60 min (includes 15 min reading)', '25%'],
  ['Long essay (LEQ)', '1, chosen from 3 options', '40 min', '15%'],
])}
<h3>The DBQ rubric (7 points)</h3>
<ul>
  <li><b>Thesis (1):</b> a historically defensible claim with a line of reasoning, in the intro or conclusion.</li>
  <li><b>Contextualization (1):</b> a few sentences on the broader events before or during the prompt's period.</li>
  <li><b>Evidence (3):</b> use the content of at least 4 documents to support your argument (2 points), plus one specific piece of evidence that is not in the documents (1 point).</li>
  <li><b>Analysis and reasoning (2):</b> explain how or why the point of view, purpose, historical situation, or audience matters for at least 2 documents (1 point), and show complex understanding (1 point), for example by weighing multiple causes or explaining both similarity and difference.</li>
</ul>
<h3>The LEQ rubric (6 points)</h3>
<p>Thesis (1), contextualization (1), evidence (2: specific examples, then examples that support the argument), and analysis and reasoning (2: use a historical reasoning skill, then show complex understanding).</p>
<h3>SAQs</h3>
<p>Each SAQ has parts a, b, and c. Answer each part in two or three sentences: <b>answer, explain, give a specific example</b>. No thesis or introduction needed.</p>
${rule('The three reasoning skills the essays test are <b>causation</b>, <b>comparison</b>, and <b>continuity and change over time</b>. Identify which one the prompt wants before you write.')}
${tip('Contextualization is the easiest point to lose. Write it first, as your opening, so you never forget it.')}`,
  check: { q: 'In a DBQ, which earns the sourcing point?', choices: ['Quoting a document at length', 'Explaining how the author\'s purpose shapes what a document says', 'Listing all seven documents in order', 'Summarizing each document in your own words'], answer: 1, why: 'Sourcing means explaining why point of view, purpose, historical situation, or audience matters to the argument, for at least two documents.' },
});

export const AP_HISTORY_COURSES = [
  {
    id: 'apush',
    subject: 'History',
    ap: true,
    icon: 'landmark',
    title: 'AP U.S. History',
    blurb: 'All nine APUSH periods, from 1491 to the present, with the causes, turning points, and themes the exam asks about, plus how the SAQ, DBQ, and LEQ are scored.',
    level: 'AP · Grades 10 to 11',
    lessons: [
      historyExamLesson('AP U.S. History'),
      {
        id: 'p1',
        title: 'Period 1: 1491 to 1607',
        mins: 7,
        body: `
<p>Before Europeans arrived, Native American societies were diverse and adapted to their environments.</p>
<ul>
  <li><b>Southwest:</b> maize cultivation spread north from Mexico, supporting settled societies like the Pueblo.</li>
  <li><b>Great Plains and Great Basin:</b> many groups were mobile hunter-gatherers.</li>
  <li><b>Northeast and Mississippi Valley:</b> a mix of farming, hunting, and permanent villages.</li>
  <li><b>Northwest and California:</b> rich in fish and game, supporting permanent villages without much farming.</li>
</ul>
<h3>Contact and the Columbian Exchange</h3>
<p>Columbus's 1492 voyage started the <b>Columbian Exchange</b>: crops (maize and potatoes to Europe; wheat and sugar to the Americas), animals (horses, cattle, pigs), and diseases. Smallpox and other diseases killed a huge share of Native people, who had no immunity.</p>
<h3>Spanish colonization</h3>
<ul>
  <li><b>Encomienda system:</b> Spanish colonists were granted Native labor, which led to brutal exploitation.</li>
  <li><b>Casta system:</b> a social hierarchy based on mixed European, African, and Native ancestry.</li>
  <li><b>Valladolid debate (1550):</b> Bartolomé de Las Casas argued against the abuse of Native people; Juan Ginés de Sepúlveda defended it.</li>
  <li>As Native populations fell, the Spanish and Portuguese turned to <b>enslaved Africans</b>.</li>
</ul>
${rule('Big theme: contact transformed both worlds. Explain changes on the European, African, and Native American sides.')}`,
        check: { q: 'Which best explains the sharp decline of Native American populations after 1492?', choices: ['Large-scale warfare among Native groups', 'Diseases like smallpox to which Native people had no immunity', 'Mass migration to Europe', 'Crop failures caused by maize'], answer: 1, why: 'Epidemic disease was the main cause of population collapse, though violence and forced labor added to it.' },
      },
      {
        id: 'p2',
        title: 'Period 2: 1607 to 1754',
        mins: 8,
        body: `
<h3>Different European colonial goals</h3>
<ul>
  <li><b>Spain:</b> conquest, converting Native people, and extracting wealth.</li>
  <li><b>France and the Netherlands:</b> trade (especially fur), with fewer settlers and more alliances and intermarriage with Native peoples.</li>
  <li><b>England:</b> large numbers of settlers, including families, who wanted land, which led to conflict with Native peoples.</li>
</ul>
<h3>The British colonial regions</h3>
<ul>
  <li><b>Chesapeake (Virginia, Maryland):</b> tobacco, indentured servants and then enslaved Africans. Jamestown (1607). <b>Bacon's Rebellion</b> (1676) pushed planters toward enslaved labor instead of indentured servants.</li>
  <li><b>New England:</b> Puritan families, towns, farming, fishing, shipbuilding. Town meetings and the Mayflower Compact show early self-government.</li>
  <li><b>Middle colonies:</b> diverse (Quakers in Pennsylvania), grain exports, relatively tolerant.</li>
  <li><b>Southern colonies and West Indies:</b> rice, indigo, and sugar plantations with large enslaved majorities.</li>
</ul>
<h3>Key developments</h3>
<ul>
  <li><b>Atlantic trade</b> linked the colonies, Britain, Africa, and the Caribbean. <b>Mercantilism</b> and the Navigation Acts tried to make colonies serve Britain.</li>
  <li><b>Salutary neglect:</b> Britain loosely enforced its rules, so colonies developed self-government (the House of Burgesses, colonial assemblies).</li>
  <li><b>The Great Awakening</b> (1730s to 1740s) and the <b>Enlightenment</b> both encouraged questioning authority.</li>
  <li>Native resistance: <b>Pueblo Revolt</b> (1680), King Philip's (Metacom's) War (1675).</li>
  <li>Slavery became hereditary and race-based through colonial law codes. The <b>Stono Rebellion</b> (1739) was a major revolt.</li>
</ul>`,
        check: { q: 'What was one major result of Bacon\'s Rebellion (1676)?', choices: ['Virginia abolished slavery', 'Planters relied more on enslaved Africans than on indentured servants', 'England granted Virginia independence', 'Puritans took control of Virginia'], answer: 1, why: 'The uprising of poor former servants alarmed elites, who turned to enslaved labor, a permanent and more controllable workforce.' },
      },
      {
        id: 'p3',
        title: 'Period 3: 1754 to 1800',
        mins: 9,
        body: `
<h3>From war to revolution</h3>
<ul>
  <li><b>French and Indian War</b> (1754 to 1763): Britain won North America east of the Mississippi but went deep into debt.</li>
  <li>Britain ended salutary neglect: the <b>Proclamation of 1763</b> (no settlement west of the Appalachians), the <b>Sugar Act</b>, <b>Stamp Act</b> (1765), <b>Townshend Acts</b>, and the <b>Coercive (Intolerable) Acts</b>.</li>
  <li>Colonists protested "no taxation without representation" through boycotts, the Stamp Act Congress, and the Sons of Liberty.</li>
  <li>Thomas Paine's <b>Common Sense</b> (1776) and the <b>Declaration of Independence</b> drew on Enlightenment ideas of natural rights.</li>
  <li>The Patriots won with French help after <b>Saratoga</b> (1777); the war ended at <b>Yorktown</b> (1781) and the Treaty of Paris (1783).</li>
</ul>
<h3>Building a government</h3>
<ul>
  <li><b>Articles of Confederation:</b> a weak central government with no power to tax or regulate trade. Success: the <b>Northwest Ordinance</b> (1787). Failure: <b>Shays' Rebellion</b> (1786) exposed its weakness.</li>
  <li><b>Constitutional Convention</b> (1787): compromises included the Great Compromise (two houses of Congress) and the Three-Fifths Compromise.</li>
  <li><b>Federalists vs. Anti-Federalists:</b> the Federalist Papers argued for ratification; Anti-Federalists demanded a <b>Bill of Rights</b> (1791).</li>
  <li>Washington's presidency: Hamilton's financial plan, the Whiskey Rebellion, and the Farewell Address warning against parties and foreign alliances. The first parties: Federalists and Democratic-Republicans.</li>
</ul>
${rule('Causation chain to know: war debt led to new taxes, which led to protest, then revolution, then a weak government, then the Constitution.')}`,
        check: { q: 'Why did Britain begin taxing the colonies directly after 1763?', choices: ['To punish the colonies for the Boston Tea Party', 'To pay off debt from the French and Indian War', 'To fund the Revolutionary War', 'Because the colonies requested representation'], answer: 1, why: 'The French and Indian War left Britain heavily in debt, and it expected the colonies to help pay for their own defense.' },
      },
      {
        id: 'p4',
        title: 'Period 4: 1800 to 1848',
        mins: 9,
        body: `
<h3>Politics</h3>
<ul>
  <li><b>Jefferson</b> (1800): the Louisiana Purchase (1803) doubled the country's size, even though Jefferson doubted the Constitution allowed it.</li>
  <li><b>Marbury v. Madison</b> (1803) established judicial review; the Marshall Court strengthened federal power (McCulloch v. Maryland, Gibbons v. Ogden).</li>
  <li><b>War of 1812</b> boosted nationalism and ended the Federalist Party. The <b>Era of Good Feelings</b> followed.</li>
  <li><b>Missouri Compromise</b> (1820): Missouri a slave state, Maine free, no slavery north of 36°30'.</li>
  <li><b>Monroe Doctrine</b> (1823): Europe should stay out of the Western Hemisphere.</li>
  <li><b>Jacksonian democracy:</b> voting expanded to nearly all white men; the spoils system; the Bank War; the Nullification Crisis; the <b>Indian Removal Act</b> (1830) and the Trail of Tears. The Whig Party formed in opposition.</li>
</ul>
<h3>The Market Revolution</h3>
<p>Canals (the Erie Canal), steamboats, and railroads linked regions. Factories grew in the North (the Lowell system), the cotton gin expanded slavery in the South, and Henry Clay's <b>American System</b> proposed a tariff, a national bank, and internal improvements.</p>
<h3>Reform and religion</h3>
<p>The <b>Second Great Awakening</b> inspired reform movements: temperance, abolition (William Lloyd Garrison, Frederick Douglass), women's rights (the <b>Seneca Falls Convention</b>, 1848), public schools (Horace Mann), and asylum reform (Dorothea Dix).</p>`,
        check: { q: 'Which movement most directly fueled reform movements like abolition and temperance in the early 1800s?', choices: ['The Enlightenment', 'The Second Great Awakening', 'Social Darwinism', 'The Progressive movement'], answer: 1, why: 'The Second Great Awakening stressed individual moral responsibility and perfecting society, which energized many reform movements.' },
      },
      {
        id: 'p5',
        title: 'Period 5: 1844 to 1877',
        mins: 9,
        body: `
<h3>Expansion and the slavery question</h3>
<ul>
  <li><b>Manifest Destiny:</b> the belief that the U.S. was destined to spread across the continent. Texas annexation (1845), Oregon (1846), and the <b>Mexican-American War</b> (1846 to 1848) added the Southwest.</li>
  <li>The <b>Wilmot Proviso</b> (failed) tried to ban slavery in land taken from Mexico.</li>
  <li><b>Compromise of 1850:</b> California free; a stronger <b>Fugitive Slave Act</b> angered Northerners. Uncle Tom's Cabin (1852) spread antislavery feeling.</li>
  <li><b>Kansas-Nebraska Act</b> (1854): popular sovereignty, leading to "Bleeding Kansas." The Republican Party formed to stop slavery's expansion.</li>
  <li><b>Dred Scott v. Sandford</b> (1857): enslaved people were not citizens, and Congress could not ban slavery in territories.</li>
  <li>John Brown's raid (1859) and Lincoln's election (1860) triggered Southern secession.</li>
</ul>
<h3>Civil War (1861 to 1865)</h3>
<p>The North had more people, factories, and railroads. The <b>Emancipation Proclamation</b> (1863) made ending slavery a war aim and kept Britain and France out. About 180,000 Black soldiers served in the Union army. Gettysburg and Vicksburg (1863) turned the war.</p>
<h3>Reconstruction (1865 to 1877)</h3>
<ul>
  <li>The <b>13th</b> (abolished slavery), <b>14th</b> (citizenship and equal protection), and <b>15th</b> (voting regardless of race) Amendments.</li>
  <li>The Freedmen's Bureau, Black officeholders, and new schools and churches. But Black Codes, the Ku Klux Klan, and sharecropping limited freedom.</li>
  <li>The <b>Compromise of 1877</b> removed federal troops from the South, ending Reconstruction.</li>
</ul>`,
        check: { q: 'What was the main issue that the Compromise of 1850 and the Kansas-Nebraska Act tried to settle?', choices: ['Tariff rates', 'Whether slavery could expand into western territories', 'Relations with Native Americans', 'The national bank'], answer: 1, why: 'Both tried to resolve whether new territories would allow slavery, and both made sectional conflict worse.' },
      },
      {
        id: 'p6',
        title: 'Period 6: 1865 to 1898',
        mins: 8,
        body: `
<h3>The Gilded Age economy</h3>
<ul>
  <li>Industrialization boomed: steel (Carnegie), oil (Rockefeller), railroads, banking (J.P. Morgan). Big business used <b>vertical and horizontal integration</b>, trusts, and monopolies.</li>
  <li>Justifications: <b>Social Darwinism</b> and Carnegie's <b>Gospel of Wealth</b> (the rich should give back through philanthropy).</li>
  <li><b>Labor:</b> long hours, low pay, and dangerous conditions. The Knights of Labor and the American Federation of Labor (AFL). Violent strikes: the Great Railroad Strike (1877), Haymarket (1886), Homestead (1892), Pullman (1894).</li>
</ul>
<h3>Society</h3>
<ul>
  <li><b>New immigration</b> from Southern and Eastern Europe, and from China until the <b>Chinese Exclusion Act</b> (1882).</li>
  <li>Cities grew fast; political machines (Tammany Hall) traded services for votes. Settlement houses (Jane Addams's Hull House) helped immigrants.</li>
  <li><b>Plessy v. Ferguson</b> (1896) upheld "separate but equal." Jim Crow laws and voting restrictions spread in the South.</li>
</ul>
<h3>The West</h3>
<p>The Homestead Act, transcontinental railroad (1869), and the slaughter of the buffalo transformed the West. Wars and the reservation system pushed Native Americans off their land; the <b>Dawes Act</b> (1887) tried to force assimilation by breaking up tribal land. Wounded Knee (1890) marked the end of armed resistance.</p>
<h3>Populism</h3>
<p>Struggling farmers formed the Grange and the <b>Populist (People's) Party</b> (1892), calling for free silver, a graduated income tax, and government ownership of railroads.</p>`,
        check: { q: 'What was the goal of the Dawes Act (1887)?', choices: ['To protect tribal landholdings', 'To assimilate Native Americans by dividing tribal land into individual plots', 'To create the first national parks', 'To end the buffalo hunt'], answer: 1, why: 'It broke up communal reservation land into individual allotments, aiming to turn Native Americans into individual farmers. Tribes lost most of their land as a result.' },
      },
      {
        id: 'p7',
        title: 'Period 7: 1890 to 1945',
        mins: 10,
        body: `
<h3>Imperialism</h3>
<p>The <b>Spanish-American War</b> (1898) gave the U.S. Puerto Rico, Guam, and the Philippines, where a long war against Filipino independence fighters followed. The Open Door policy (China), the Roosevelt Corollary, and the Panama Canal expanded U.S. power.</p>
<h3>The Progressive Era</h3>
<ul>
  <li><b>Muckrakers</b> exposed problems: Upton Sinclair's The Jungle led to the Meat Inspection Act and Pure Food and Drug Act (1906).</li>
  <li>Reforms: trust-busting, the 16th (income tax), 17th (direct election of senators), 18th (Prohibition), and 19th (women's suffrage, 1920) Amendments.</li>
  <li>Presidents: Theodore Roosevelt (Square Deal), Taft, Wilson (New Freedom, Federal Reserve).</li>
</ul>
<h3>World War I and the 1920s</h3>
<p>The U.S. entered WWI in 1917. At home: the Espionage and Sedition Acts, the Great Migration of Black Americans north, and the first Red Scare. The Senate rejected the Treaty of Versailles and the League of Nations. The 1920s brought consumer culture, the Harlem Renaissance, immigration quotas (1924), and cultural clashes like the Scopes Trial.</p>
<h3>The Great Depression and New Deal</h3>
<p>The 1929 crash and bank failures led to 25% unemployment. FDR's <b>New Deal</b> pursued "relief, recovery, and reform": the CCC, WPA, FDIC, SEC, <b>Social Security</b>, and the Wagner Act protecting unions. It greatly expanded the federal government's role.</p>
<h3>World War II</h3>
<p>After Pearl Harbor (1941) the U.S. fully mobilized: women entered factories, the Great Migration continued, and the economy recovered. <b>Japanese American internment</b> (upheld in Korematsu v. U.S.) is a key civil liberties issue. The war ended with the atomic bombings of Hiroshima and Nagasaki in 1945.</p>`,
        check: { q: 'Which best describes the overall effect of the New Deal?', choices: ['It ended the Great Depression by 1934', 'It permanently expanded the federal government\'s role in the economy and social welfare', 'It returned the U.S. to laissez-faire policies', 'It was mostly struck down and had no lasting effect'], answer: 1, why: 'Programs like Social Security, the FDIC, and the SEC permanently expanded what Americans expected the federal government to do. Full recovery came with WWII.' },
      },
      {
        id: 'p8',
        title: 'Period 8: 1945 to 1980',
        mins: 10,
        body: `
<h3>The Cold War</h3>
<ul>
  <li><b>Containment:</b> the Truman Doctrine (1947), Marshall Plan, NATO (1949), the Berlin Airlift.</li>
  <li>Hot wars: <b>Korea</b> (1950 to 1953) and <b>Vietnam</b> (Gulf of Tonkin Resolution 1964, Tet Offensive 1968, withdrawal 1973).</li>
  <li>The arms race, Sputnik, and the <b>Cuban Missile Crisis</b> (1962). Nixon's détente with the USSR and opening to China.</li>
  <li>At home: the second Red Scare and <b>McCarthyism</b>.</li>
</ul>
<h3>Civil rights</h3>
<ul>
  <li><b>Brown v. Board of Education</b> (1954) overturned "separate but equal" in schools.</li>
  <li>The Montgomery Bus Boycott (1955), sit-ins, Freedom Rides, the March on Washington (1963), and Selma (1965).</li>
  <li><b>Civil Rights Act</b> (1964) banned discrimination in public places and employment; <b>Voting Rights Act</b> (1965) banned literacy tests and added federal oversight.</li>
  <li>Other movements: Black Power, the women's movement (NOW, the Equal Rights Amendment fight), the Chicano movement (César Chávez), the American Indian Movement, and gay rights after Stonewall (1969).</li>
</ul>
<h3>Society and politics</h3>
<p>Postwar prosperity, the GI Bill, suburbs, and the baby boom. LBJ's <b>Great Society</b> created Medicare, Medicaid, and the War on Poverty. The counterculture and antiwar protests divided the country. Watergate led to Nixon's resignation (1974), and the 1970s brought inflation and the energy crisis.</p>`,
        check: { q: 'What was the U.S. policy of containment?', choices: ['Stopping the spread of communism beyond where it already existed', 'Isolating the U.S. from world affairs', 'Rolling back communism through direct invasion of the USSR', 'Limiting immigration from Europe'], answer: 0, why: 'Containment aimed to stop communism from spreading, using aid (Marshall Plan), alliances (NATO), and sometimes war (Korea, Vietnam).' },
      },
      {
        id: 'p9',
        title: 'Period 9: 1980 to the present',
        mins: 7,
        body: `
<ul>
  <li><b>The conservative resurgence:</b> Ronald Reagan (1980) cut taxes and regulation, increased defense spending, and appealed to the New Right and religious conservatives. "Reaganomics" relied on supply-side economics.</li>
  <li><b>The end of the Cold War:</b> Gorbachev's reforms, the fall of the Berlin Wall (1989), and the collapse of the USSR (1991).</li>
  <li><b>New role in the world:</b> the Gulf War (1991), interventions in the Balkans, and after the <b>September 11, 2001</b> attacks, the War on Terror, the wars in Afghanistan and Iraq, and debates over the Patriot Act and civil liberties.</li>
  <li><b>Economy:</b> the shift from manufacturing to services and technology, globalization (NAFTA, 1994), the internet, growing income inequality, and the 2008 financial crisis.</li>
  <li><b>Society:</b> immigration (especially from Latin America and Asia) changed demographics; debates over immigration, the environment, and the role of government continued.</li>
</ul>
${rule('Period 9 is lightly tested (about 5% of the exam). Focus on Reagan, the end of the Cold War, globalization, and 9/11.')}`,
        check: { q: 'Which policy is most associated with Reagan\'s presidency?', choices: ['Creating Medicare', 'Cutting taxes and regulations to encourage growth', 'Nationalizing major industries', 'Ending the arms race by disarming'], answer: 1, why: 'Reagan\'s supply-side policies cut taxes and regulation, though defense spending rose sharply.' },
      },
    ],
  },

  {
    id: 'ap-world',
    subject: 'History',
    ap: true,
    icon: 'globe',
    title: 'AP World History: Modern',
    blurb: 'Global history from 1200 to the present: empires, trade networks, revolutions, industrialization, world wars, decolonization, and globalization.',
    level: 'AP · Grades 9 to 10',
    lessons: [
      historyExamLesson('AP World History'),
      {
        id: 'u1',
        title: 'Unit 1: The Global Tapestry (1200 to 1450)',
        mins: 8,
        body: `
<p>This unit surveys how states developed and kept power in different regions around 1200.</p>
<ul>
  <li><b>East Asia:</b> the <b>Song Dynasty</b> used Confucianism and the civil service exam to run a large bureaucracy. Champa rice, the Grand Canal, and commercialization grew the economy. Neo-Confucianism spread to Korea, Japan, and Vietnam.</li>
  <li><b>Dar al-Islam:</b> the Abbasid Caliphate declined and new Muslim states rose (the Seljuks, Mamluks, Delhi Sultanate). Muslim scholars advanced math, medicine, and preserved Greek texts.</li>
  <li><b>South and Southeast Asia:</b> Hinduism and Buddhism shaped states like the Vijayanagara Empire, the Khmer Empire (Angkor Wat), and the sea-based Srivijaya Empire. Majapahit controlled sea trade.</li>
  <li><b>The Americas:</b> the <b>Aztec (Mexica)</b> used a tribute system; the <b>Inca</b> used the mit'a labor system and roads. Earlier, Cahokia and the Maya city-states.</li>
  <li><b>Africa:</b> <b>Mali</b> grew rich on gold and trans-Saharan trade (Mansa Musa); the Swahili city-states traded across the Indian Ocean; Great Zimbabwe; Ethiopia was Christian.</li>
  <li><b>Europe:</b> decentralized <b>feudalism</b> and manorialism; the Catholic Church was the main unifying force.</li>
</ul>
${rule('Tested skill: comparing how states gained and kept power. Common methods are religion, bureaucracy, tribute, military force, and trade.')}`,
        check: { q: 'How did the Song Dynasty mainly staff its government?', choices: ['Inheritance of offices by nobles', 'A civil service exam based on Confucian texts', 'Election by local villages', 'Appointment of Buddhist monks'], answer: 1, why: 'The Song expanded the civil service exam, which selected officials based on knowledge of Confucian classics.' },
      },
      {
        id: 'u2',
        title: 'Unit 2: Networks of Exchange (1200 to 1450)',
        mins: 8,
        body: `
<h3>The trade routes</h3>
<ul>
  <li><b>Silk Roads:</b> luxury goods (silk, porcelain) moved overland. Caravanserai, paper money (flying cash), and banking made trade easier.</li>
  <li><b>Indian Ocean:</b> the largest network, powered by the <b>monsoon winds</b>. Goods included spices, cotton, and porcelain. Merchant communities (diasporas) settled in port cities like Calicut and Malacca.</li>
  <li><b>Trans-Saharan:</b> camels and camel saddles made crossing the Sahara possible. Gold and salt were key goods, and the trade made Mali powerful.</li>
</ul>
<h3>The Mongols</h3>
<p>The <b>Mongol Empire</b>, the largest land empire in history, conquered much of Eurasia under Chinggis Khan and his successors. They taxed and protected Silk Road trade (the "Pax Mongolica"), which spread technology and ideas, but also helped spread the <b>Black Death</b> in the 1300s.</p>
<h3>Effects of exchange</h3>
<ul>
  <li><b>Cultural diffusion:</b> Islam spread through merchants into West Africa and Southeast Asia; Buddhism spread across Asia.</li>
  <li><b>Travelers</b> like Ibn Battuta and Marco Polo recorded the connected world.</li>
  <li><b>Technology and crops:</b> gunpowder and paper moved west; Champa rice spread; sugar and citrus spread through the Muslim world.</li>
</ul>`,
        check: { q: 'What made Indian Ocean trade predictable enough to grow so large?', choices: ['Camel caravans', 'Knowledge of the seasonal monsoon winds', 'The Mongol postal relay system', 'Steam-powered ships'], answer: 1, why: 'Sailors timed voyages to the monsoons, which reverse direction seasonally, making long trips regular and reliable.' },
      },
      {
        id: 'u3',
        title: 'Unit 3: Land-Based Empires (1450 to 1750)',
        mins: 8,
        body: `
<p>The <b>gunpowder empires</b> used cannons and firearms to expand and hold large territories.</p>
<ul>
  <li><b>Ottoman Empire</b> (Sunni): took Constantinople in 1453. Used the <b>devshirme</b> system to recruit Christian boys as janissaries (soldiers) and officials.</li>
  <li><b>Safavid Empire</b> (Shia, Persia): its conflict with the Ottomans deepened the Sunni-Shia split.</li>
  <li><b>Mughal Empire</b> (India): Muslim rulers over a Hindu majority. <b>Akbar</b> practiced religious tolerance; later Aurangzeb did not. Built the Taj Mahal.</li>
  <li><b>Qing Dynasty</b> (China): Manchu rulers kept Confucian bureaucracy and limited foreign trade.</li>
  <li><b>Tokugawa Japan:</b> centralized power under the shogun and isolated Japan from most foreign contact.</li>
</ul>
<h3>Ways rulers legitimized and consolidated power</h3>
<ul>
  <li><b>Monumental architecture</b> (Versailles, the Taj Mahal), <b>religion</b> (divine right in Europe), and <b>bureaucracy</b>, including tax farming (Mughal zamindars, Ottoman tax farmers).</li>
</ul>
<h3>Religion in Europe</h3>
<p>The <b>Protestant Reformation</b> (Luther, 1517) split Western Christianity and led to religious wars. The Catholic Church responded with the Counter-Reformation.</p>`,
        check: { q: 'What was the devshirme system?', choices: ['A Mughal tax on non-Muslims', 'The Ottoman practice of taking Christian boys to train as soldiers and officials', 'A Safavid religious school', 'The Qing civil service exam'], answer: 1, why: 'The Ottomans recruited Christian boys from the Balkans, converted them, and trained them as janissaries and administrators loyal only to the sultan.' },
      },
      {
        id: 'u4',
        title: 'Unit 4: Transoceanic Interconnections (1450 to 1750)',
        mins: 9,
        body: `
<h3>Why exploration took off</h3>
<p>New technology (the caravel, the astrolabe, magnetic compass, better maps) and state support, like Portugal's Prince Henry, drove European exploration. Motives: gold, God, and glory, plus a sea route to Asian spices.</p>
<h3>Major effects</h3>
<ul>
  <li><b>The Columbian Exchange:</b> disease devastated the Americas; new crops (potatoes, maize) fed population growth in Afro-Eurasia.</li>
  <li><b>Maritime empires:</b> Portugal built a <b>trading-post empire</b> in the Indian Ocean; Spain conquered the Aztec and Inca; the Dutch and British used <b>joint-stock companies</b> (the Dutch East India Company, the British East India Company).</li>
  <li><b>Silver:</b> mined at Potosí with mit'a labor, silver flowed to China, which required taxes in silver. It made trade truly global.</li>
  <li><b>Labor systems:</b> the <b>Atlantic slave trade</b> moved about 12 million enslaved Africans; the encomienda and hacienda systems; indentured servitude.</li>
  <li><b>Social hierarchies:</b> the casta system in Spanish America.</li>
</ul>
<h3>Resistance</h3>
<p>The Pueblo Revolt, maroon communities of escaped enslaved people, and the Ana Nzinga resistance against the Portuguese in Angola.</p>`,
        check: { q: 'Why did so much American silver end up in China?', choices: ['China conquered Spanish colonies', 'China\'s economy demanded silver, partly because taxes had to be paid in it', 'Silver was used to build the Great Wall', 'The Mongols required silver tribute'], answer: 1, why: 'Ming China\'s shift to silver-based taxes created huge demand, and Spanish silver from Potosí flowed there through Manila and Europe.' },
      },
      {
        id: 'u5',
        title: 'Unit 5: Revolutions (1750 to 1900)',
        mins: 9,
        body: `
<h3>Enlightenment and political revolutions</h3>
<p>Enlightenment thinkers (Locke's natural rights, Rousseau's social contract, Montesquieu's separation of powers) challenged absolute monarchy and inspired revolutions:</p>
<ul>
  <li><b>American Revolution</b> (1776): independence and a republic.</li>
  <li><b>French Revolution</b> (1789): ended the monarchy, issued the Declaration of the Rights of Man, then the Terror and Napoleon.</li>
  <li><b>Haitian Revolution</b> (1791 to 1804): the only successful revolt by enslaved people that founded a state, led by Toussaint Louverture.</li>
  <li><b>Latin American independence</b> (1810s to 1820s): led by creoles like Simón Bolívar.</li>
</ul>
<p><b>Nationalism</b> unified Italy and Germany (Bismarck) and fueled independence movements.</p>
<h3>The Industrial Revolution</h3>
<ul>
  <li>Began in <b>Britain</b> because of coal and iron, rivers and ports, capital from trade, and an agricultural revolution that freed workers.</li>
  <li>The factory system, steam engine, and later the <b>Second Industrial Revolution</b> (steel, chemicals, electricity).</li>
  <li>Spread to Western Europe, the U.S., Russia, and <b>Japan</b> (the <b>Meiji Restoration</b>, state-led industrialization).</li>
</ul>
<h3>Responses</h3>
<p>Workers formed unions; Marx and Engels wrote the Communist Manifesto (1848). Reforms like expanded voting and factory laws followed.</p>`,
        check: { q: 'Why is the Haitian Revolution historically unique?', choices: ['It was the first revolution in the Americas', 'It was the only successful revolt by enslaved people that created an independent state', 'It restored the French monarchy', 'It was led by European settlers'], answer: 1, why: 'Enslaved Africans overthrew French rule and founded Haiti in 1804, inspiring fear among slaveholders across the Americas.' },
      },
      {
        id: 'u6',
        title: 'Unit 6: Consequences of Industrialization (1750 to 1900)',
        mins: 8,
        body: `
<h3>The new imperialism</h3>
<p>Industrial states needed raw materials and markets, and they had new tools: steamships, the telegraph, quinine (against malaria), and machine guns.</p>
<ul>
  <li><b>Africa:</b> the <b>Berlin Conference</b> (1884 to 1885) divided Africa among European powers with no Africans present.</li>
  <li><b>Asia:</b> Britain ruled India directly after 1857; the <b>Opium Wars</b> forced China to open ports (unequal treaties, spheres of influence).</li>
  <li><b>Justifications:</b> Social Darwinism and the "civilizing mission" (the "White Man's Burden").</li>
</ul>
<h3>Resistance</h3>
<p>The <b>Sepoy Rebellion</b> (1857) in India, the <b>Boxer Rebellion</b> (1900) in China, the Xhosa Cattle Killing movement, and Ethiopia's victory over Italy at Adwa (1896).</p>
<h3>Global economy and migration</h3>
<ul>
  <li>Colonies became exporters of cash crops and raw materials (cotton, rubber, palm oil), creating <b>economic dependence</b>.</li>
  <li><b>Migration:</b> millions moved to cities and abroad, including indentured laborers from India and China working in the Caribbean, Africa, and the Pacific.</li>
  <li>Reactions to migrants: the Chinese Exclusion Act (U.S.) and the White Australia policy.</li>
</ul>`,
        check: { q: 'What was the Berlin Conference (1884 to 1885)?', choices: ['A peace treaty ending WWI', 'A meeting where European powers set rules for dividing Africa', 'A conference on ending the slave trade in Asia', 'The founding of the League of Nations'], answer: 1, why: 'European powers agreed on rules for claiming African territory, accelerating the Scramble for Africa without African input.' },
      },
      {
        id: 'u7',
        title: 'Unit 7: Global Conflict (1900 to present)',
        mins: 9,
        body: `
<h3>World War I (1914 to 1918)</h3>
<p>Causes: <b>MAIN</b>: militarism, alliances, imperialism, nationalism, plus the assassination of Archduke Franz Ferdinand. It was a <b>total war</b>: governments directed whole economies, used propaganda, and recruited colonial soldiers. The war destroyed four empires (Russian, German, Austro-Hungarian, Ottoman).</p>
<h3>Between the wars</h3>
<ul>
  <li>The <b>Russian Revolution</b> (1917) created the first communist state; Stalin later forced collectivization and five-year plans.</li>
  <li>The <b>Treaty of Versailles</b> punished Germany and created the League of Nations.</li>
  <li>The <b>Great Depression</b> led governments to intervene in economies (the New Deal) and helped fascists rise (Mussolini, Hitler).</li>
  <li>Japan expanded into Manchuria (1931) and China (1937).</li>
</ul>
<h3>World War II (1939 to 1945)</h3>
<p>Allied (Britain, the USSR, the U.S., China) vs. Axis (Germany, Italy, Japan). Total war again, with mass bombing of cities and the atomic bomb. The <b>Holocaust</b> killed six million Jews and millions of others. Other mass atrocities in the century include the Armenian genocide, the Holodomor, and the Rwandan genocide.</p>`,
        check: { q: 'What does "total war" mean?', choices: ['A war fought only by professional armies', 'A war in which governments mobilize the whole society and economy', 'A war that ends in total surrender', 'A war fought on every continent'], answer: 1, why: 'In total war, states direct industry, ration goods, use propaganda, and draft civilians into the war effort.' },
      },
      {
        id: 'u8',
        title: 'Unit 8: Cold War and Decolonization (1900 to present)',
        mins: 9,
        body: `
<h3>The Cold War</h3>
<ul>
  <li>The U.S. (capitalism, democracy) vs. the USSR (communism). Alliances: <b>NATO</b> vs. the <b>Warsaw Pact</b>.</li>
  <li><b>Proxy wars</b> in Korea, Vietnam, Afghanistan, and Angola; the nuclear arms race; the Cuban Missile Crisis.</li>
  <li>The <b>Non-Aligned Movement</b> (India's Nehru, Indonesia's Sukarno) refused to pick a side.</li>
  <li><b>China:</b> Mao's communist victory (1949), the Great Leap Forward (famine), and the Cultural Revolution.</li>
  <li>The Cold War ended with the fall of the USSR in 1991, after Gorbachev's reforms (glasnost and perestroika).</li>
</ul>
<h3>Decolonization</h3>
<ul>
  <li><b>Negotiated independence:</b> India (1947, Gandhi's nonviolent resistance; partition with Pakistan caused mass violence and migration), Ghana (1957).</li>
  <li><b>Armed struggle:</b> Algeria against France, Vietnam against France, Kenya (the Mau Mau uprising), Angola against Portugal.</li>
  <li>New states faced ethnic conflict, borders drawn by colonizers, and economic dependence. Some leaders pursued state-led development (Nasser in Egypt).</li>
  <li><b>Apartheid</b> in South Africa lasted until 1994, ended by resistance led by Nelson Mandela and the ANC and by international pressure.</li>
</ul>`,
        check: { q: 'What was the Non-Aligned Movement?', choices: ['NATO countries that refused nuclear weapons', 'Newly independent nations that refused to formally side with either the U.S. or the USSR', 'Communist countries opposed to Stalin', 'European nations that stayed neutral in WWII'], answer: 1, why: 'Led by countries like India, Indonesia, and Egypt, it sought independence from both Cold War blocs.' },
      },
      {
        id: 'u9',
        title: 'Unit 9: Globalization (1900 to present)',
        mins: 7,
        body: `
<ul>
  <li><b>Technology:</b> radio, air travel, the internet, and cell phones made the world far more connected. The <b>Green Revolution</b> raised crop yields with new seeds, fertilizers, and irrigation, though it favored wealthier farmers.</li>
  <li><b>Medicine:</b> vaccines and antibiotics cut death rates (smallpox was eradicated), but HIV/AIDS, malaria, and new pandemics remain.</li>
  <li><b>Environment:</b> population growth, fossil fuels, and deforestation drive climate change and pollution.</li>
  <li><b>Economy:</b> free-market policies spread (Thatcher, Reagan, Deng Xiaoping's reforms in China). Free trade agreements and organizations like the WTO and NAFTA. Multinational corporations.</li>
  <li><b>Rights movements:</b> the Universal Declaration of Human Rights (1948), women's rights, civil rights, and the anti-apartheid movement.</li>
  <li><b>Global culture:</b> sports, music, and media spread worldwide (Bollywood, K-pop, reggae). Some groups resisted globalization to protect local cultures or jobs.</li>
  <li><b>Institutions:</b> the United Nations, the European Union, ASEAN, and the African Union.</li>
</ul>`,
        check: { q: 'What was the Green Revolution?', choices: ['A movement to protect rainforests', 'Agricultural advances like high-yield seeds and fertilizer that greatly increased food production', 'The rise of renewable energy', 'A political revolution in Ireland'], answer: 1, why: 'Starting in the mid-1900s, new crop varieties and techniques greatly raised yields, especially in Asia and Latin America.' },
      },
    ],
  },

  {
    id: 'ap-euro',
    subject: 'History',
    ap: true,
    icon: 'scroll',
    title: 'AP European History',
    blurb: 'Europe from the Renaissance to today: the Reformation, absolutism, the Enlightenment, revolutions, industrialization, the world wars, and the Cold War.',
    level: 'AP · Grades 10 to 12',
    lessons: [
      historyExamLesson('AP European History'),
      {
        id: 'u1',
        title: 'Unit 1: Renaissance and Exploration',
        mins: 8,
        body: `
<p>Covers about 1450 to 1648.</p>
<h3>The Italian Renaissance</h3>
<ul>
  <li><b>Humanism:</b> studying classical Greek and Roman texts and focusing on human potential (Petrarch). <b>Civic humanism</b> trained citizens for public life.</li>
  <li>Wealthy city-states and patrons (the Medici in Florence) funded art. Artists used perspective and realism (Leonardo, Michelangelo, Raphael).</li>
  <li><b>Machiavelli's The Prince</b> described politics as it is, not as it should be.</li>
</ul>
<h3>The Northern Renaissance</h3>
<p>Christian humanists (Erasmus, Thomas More) applied humanist study to religion. The <b>printing press</b> (Gutenberg, about 1450) spread ideas quickly and raised literacy.</p>
<h3>New monarchies</h3>
<p>Rulers in France, England, and Spain centralized power: standing armies, taxes, and less reliance on nobles.</p>
<h3>Exploration</h3>
<p>Portugal and Spain led, motivated by "gold, God, and glory." Results: the Columbian Exchange, the Commercial Revolution (joint-stock companies, banking), the Price Revolution (inflation from American silver), and the Atlantic slave trade.</p>`,
        check: { q: 'How did the printing press affect the Renaissance and Reformation?', choices: ['It made books more expensive', 'It spread new ideas quickly and widely', 'It was banned throughout Europe', 'It was used only for Latin Bibles'], answer: 1, why: 'Cheap printed books and pamphlets spread humanist and Protestant ideas rapidly and increased literacy.' },
      },
      {
        id: 'u2',
        title: 'Unit 2: The Age of Reformation',
        mins: 8,
        body: `
<ul>
  <li><b>Martin Luther</b> (95 Theses, 1517) attacked the sale of indulgences and taught salvation by faith alone and scripture as the sole authority.</li>
  <li><b>John Calvin</b> taught predestination; Calvinism spread to Switzerland, France (Huguenots), the Netherlands, and Scotland.</li>
  <li><b>England:</b> Henry VIII broke with Rome to annul his marriage, creating the Church of England (1534). Elizabeth I settled on a moderate Protestant church.</li>
  <li><b>Anabaptists</b> rejected infant baptism and were persecuted by both Catholics and Protestants.</li>
</ul>
<h3>The Catholic (Counter-) Reformation</h3>
<p>The <b>Council of Trent</b> (1545 to 1563) reaffirmed Catholic doctrine and fixed abuses. The <b>Jesuits</b> spread Catholicism through education and missions. The Index of Prohibited Books and the Inquisition fought heresy.</p>
<h3>Wars of religion</h3>
<ul>
  <li>The French Wars of Religion ended with the <b>Edict of Nantes</b> (1598), which tolerated Huguenots.</li>
  <li>The <b>Peace of Augsburg</b> (1555) let German princes choose Lutheranism or Catholicism.</li>
  <li>The <b>Thirty Years' War</b> (1618 to 1648) devastated Germany. The <b>Peace of Westphalia</b> recognized Calvinism and established the principle of state sovereignty.</li>
</ul>`,
        check: { q: 'What did the Peace of Westphalia (1648) do?', choices: ['Ended the Hundred Years\' War', 'Ended the Thirty Years\' War and strengthened the idea of state sovereignty', 'Created the Church of England', 'Started the Counter-Reformation'], answer: 1, why: 'It ended the Thirty Years\' War, recognized Calvinism, and set the precedent of sovereign states controlling their own affairs.' },
      },
      {
        id: 'u3',
        title: 'Unit 3: Absolutism and Constitutionalism',
        mins: 8,
        body: `
<p>Covers about 1648 to 1815.</p>
<h3>Absolutism</h3>
<ul>
  <li><b>Louis XIV of France</b> ("I am the state") claimed <b>divine right</b>, built Versailles to control the nobles, and revoked the Edict of Nantes. His minister Colbert used mercantilism.</li>
  <li><b>Peter the Great</b> westernized Russia and built St. Petersburg.</li>
  <li><b>Prussia</b> built a powerful army with the support of the Junker nobility. <b>Austria</b> ruled a diverse Habsburg empire.</li>
</ul>
<h3>Constitutionalism</h3>
<ul>
  <li><b>England:</b> the conflict between the Stuart kings and Parliament led to the English Civil War, Charles I's execution, and Cromwell's rule. The <b>Glorious Revolution</b> (1688) and the <b>English Bill of Rights</b> (1689) established a constitutional monarchy with Parliament supreme.</li>
  <li><b>The Dutch Republic:</b> a wealthy, tolerant, commercial republic.</li>
</ul>
<h3>Balance of power</h3>
<p>European states formed shifting alliances to stop any one power from dominating (the War of the Spanish Succession, the Seven Years' War).</p>
<h3>Economy</h3>
<p>The Agricultural Revolution (crop rotation, enclosure) and the putting-out (cottage) system set the stage for industrialization.</p>`,
        check: { q: 'What did the Glorious Revolution establish in England?', choices: ['Absolute monarchy', 'A constitutional monarchy in which Parliament held supreme power', 'A communist republic', 'Catholicism as the state religion'], answer: 1, why: 'William and Mary accepted the Bill of Rights, limiting royal power and making Parliament supreme.' },
      },
      {
        id: 'u4',
        title: 'Unit 4: Science, Enlightenment, and Politics',
        mins: 8,
        body: `
<h3>The Scientific Revolution</h3>
<p>Copernicus (a sun-centered universe), Kepler (elliptical orbits), Galileo (telescope observations; tried by the Church), and <b>Newton</b> (laws of motion and gravity). Bacon promoted the empirical, inductive method; Descartes promoted deductive reasoning ("I think, therefore I am").</p>
<h3>The Enlightenment</h3>
<ul>
  <li><b>Locke:</b> natural rights (life, liberty, property); government by consent.</li>
  <li><b>Hobbes:</b> people need a strong ruler to escape a brutish state of nature.</li>
  <li><b>Montesquieu:</b> separation of powers. <b>Voltaire:</b> religious tolerance, free speech. <b>Rousseau:</b> the social contract and the general will.</li>
  <li><b>Adam Smith:</b> laissez-faire economics (The Wealth of Nations, 1776).</li>
  <li><b>Mary Wollstonecraft:</b> education and rights for women.</li>
  <li>Ideas spread through salons, coffeehouses, and the Encyclopédie. <b>Deism</b> pictured God as a clockmaker.</li>
</ul>
<h3>Enlightened absolutism</h3>
<p>Some monarchs adopted reforms while keeping full power: Frederick the Great (Prussia), Catherine the Great (Russia), and Joseph II (Austria).</p>`,
        check: { q: 'Which Enlightenment thinker argued for separating government into branches?', choices: ['Hobbes', 'Montesquieu', 'Adam Smith', 'Descartes'], answer: 1, why: 'Montesquieu\'s The Spirit of the Laws argued that separating powers prevents tyranny.' },
      },
      {
        id: 'u5',
        title: 'Unit 5: Conflict, Crisis, and Reaction (late 1700s)',
        mins: 8,
        body: `
<h3>The French Revolution</h3>
<ol>
  <li><b>Causes:</b> debt (partly from helping the American Revolution), an unfair tax system (the Third Estate paid most taxes), Enlightenment ideas, and bread shortages.</li>
  <li><b>Liberal phase</b> (1789 to 1792): the Estates-General became the National Assembly, the Tennis Court Oath, the storming of the Bastille, the <b>Declaration of the Rights of Man and of the Citizen</b>, and a constitutional monarchy.</li>
  <li><b>Radical phase</b> (1792 to 1794): France became a republic, Louis XVI was executed, and Robespierre's <b>Reign of Terror</b> executed thousands.</li>
  <li><b>The Directory</b> (1795 to 1799), then <b>Napoleon</b>.</li>
</ol>
<h3>Napoleon</h3>
<p>He centralized France, signed the Concordat with the Church, and created the <b>Napoleonic Code</b> (legal equality for men, but limited rights for women). His conquests spread revolutionary ideas and sparked nationalism in the lands he conquered. Defeated in Russia (1812) and at Waterloo (1815).</p>
<h3>Reaction</h3>
<p>The <b>Congress of Vienna</b> (1815), led by Metternich, restored monarchies and a balance of power. Romanticism reacted against Enlightenment reason with emotion and nature.</p>`,
        check: { q: 'What was the goal of the Congress of Vienna (1815)?', choices: ['To spread revolutionary ideas across Europe', 'To restore monarchies and a balance of power after Napoleon', 'To unify Germany', 'To divide Africa'], answer: 1, why: 'Led by conservatives like Metternich, it restored legitimate rulers and balanced power to prevent another French-style upheaval.' },
      },
      {
        id: 'u6',
        title: 'Unit 6: Industrialization and Its Effects',
        mins: 8,
        body: `
<p>Covers about 1815 to 1914.</p>
<ul>
  <li><b>Britain industrialized first:</b> coal and iron, capital, colonies and markets, and workers freed by the Agricultural Revolution. Textiles, the steam engine, and railroads led.</li>
  <li>Continental Europe followed, often with more government help. The <b>Second Industrial Revolution</b> (after 1870) brought steel, chemicals, electricity, and the internal combustion engine.</li>
</ul>
<h3>Social effects</h3>
<ul>
  <li>Rapid urbanization caused crowding, disease, and pollution, leading to reforms like sewers and public health laws.</li>
  <li>A new <b>middle class</b> and an industrial <b>working class</b>. The "separate spheres" ideal confined middle-class women to the home.</li>
  <li>Factory and child labor laws (Britain's Factory Act of 1833).</li>
</ul>
<h3>New ideologies</h3>
<ul>
  <li><b>Liberalism:</b> individual rights, constitutions, free markets.</li>
  <li><b>Conservatism:</b> tradition, monarchy, and established churches (Burke, Metternich).</li>
  <li><b>Socialism:</b> utopian socialists (Owen, Fourier), then <b>Marx</b>: history is class struggle, and workers (the proletariat) would overthrow capitalists.</li>
  <li><b>Nationalism:</b> loyalty to a people sharing a language and culture.</li>
</ul>`,
        check: { q: 'According to Marx, what drives history?', choices: ['Great individual leaders', 'Class struggle between those who own production and those who work', 'Religious conflict', 'Geography and climate'], answer: 1, why: 'Marx argued that conflict between economic classes, ultimately workers versus capitalists, drives historical change.' },
      },
      {
        id: 'u7',
        title: 'Unit 7: 19th-Century Perspectives and Politics',
        mins: 8,
        body: `
<ul>
  <li><b>Revolutions of 1848:</b> liberal and nationalist revolts spread across Europe. Most failed in the short run, but they ended serfdom in Austria and helped spread liberal ideas.</li>
  <li><b>Italian unification:</b> Cavour (diplomacy) and Garibaldi (Red Shirts) unified Italy by 1870.</li>
  <li><b>German unification:</b> <b>Bismarck</b> used <b>realpolitik</b> (practical, power-based politics) and three wars to unify Germany in 1871 under Prussia.</li>
  <li><b>Reforms:</b> Britain expanded voting through Reform Acts; Russia emancipated the serfs (1861).</li>
  <li><b>New imperialism:</b> the Scramble for Africa and the Berlin Conference, justified by Social Darwinism and the "civilizing mission."</li>
  <li><b>Science and culture:</b> Darwin's theory of evolution, Freud's psychology, and realism and then modernism in art.</li>
  <li><b>Mass politics:</b> political parties, unions, women's suffrage movements, and rising antisemitism (the Dreyfus Affair).</li>
</ul>
${rule('Realpolitik means pursuing national interest through practical means, including war, rather than ideals. Bismarck is the classic example.')}`,
        check: { q: 'Which best describes Bismarck\'s approach to unifying Germany?', choices: ['Peaceful votes in every German state', 'Realpolitik: practical diplomacy and strategic wars', 'A liberal revolution from below', 'An alliance with France'], answer: 1, why: 'Bismarck used calculated wars against Denmark, Austria, and France to unify Germany under Prussian leadership.' },
      },
      {
        id: 'u8',
        title: 'Unit 8: 20th-Century Global Conflicts',
        mins: 9,
        body: `
<h3>World War I</h3>
<p>Causes: militarism, alliances (Triple Entente vs. Triple Alliance), imperialism, and nationalism, triggered by the assassination of Franz Ferdinand (1914). Trench warfare and new weapons caused massive casualties. The <b>Treaty of Versailles</b> blamed Germany (the war guilt clause), imposed reparations, and redrew the map.</p>
<h3>The Russian Revolution</h3>
<p>In 1917 the tsar fell, then <b>Lenin's</b> Bolsheviks seized power. Stalin later imposed five-year plans, forced collectivization, and the Great Purge.</p>
<h3>The interwar years</h3>
<p>The Great Depression helped <b>fascism</b> rise: Mussolini in Italy and Hitler in Germany. Totalitarian states used propaganda, terror, and a single party. Appeasement (the Munich Agreement, 1938) failed to stop Hitler.</p>
<h3>World War II</h3>
<p>Germany invaded Poland in 1939. Blitzkrieg, the Battle of Britain, the invasion of the USSR, and D-Day. The <b>Holocaust</b> murdered six million Jews and millions of others. The war ended in 1945 with Europe devastated and divided.</p>`,
        check: { q: 'Which policy did Britain and France follow toward Hitler at Munich in 1938?', choices: ['Containment', 'Appeasement', 'Détente', 'Realpolitik'], answer: 1, why: 'They allowed Germany to annex the Sudetenland, hoping to avoid war. Hitler kept expanding.' },
      },
      {
        id: 'u9',
        title: 'Unit 9: Cold War and Contemporary Europe',
        mins: 8,
        body: `
<ul>
  <li><b>A divided Europe:</b> the "Iron Curtain" separated the democratic West and the Soviet-controlled East. NATO vs. the Warsaw Pact; the Berlin Wall (1961).</li>
  <li><b>Recovery:</b> the <b>Marshall Plan</b> rebuilt Western Europe. Western states built <b>welfare states</b> (national health care, pensions).</li>
  <li><b>Integration:</b> the European Coal and Steel Community (1951) grew into the European Economic Community and then the <b>European Union</b> (1993) and the euro.</li>
  <li><b>Revolts in the East:</b> Hungary (1956) and the Prague Spring (1968) were crushed. Poland's <b>Solidarity</b> union challenged communism in the 1980s.</li>
  <li><b>The end of communism:</b> Gorbachev's glasnost and perestroika, the fall of the Berlin Wall (1989), and the collapse of the USSR (1991). Yugoslavia broke apart in violent ethnic wars.</li>
  <li><b>Decolonization:</b> Europe lost its empires (India 1947, Algeria 1962).</li>
  <li><b>Recent issues:</b> immigration, Brexit (2016), terrorism, climate policy, and Russia's wars in Ukraine.</li>
</ul>`,
        check: { q: 'What grew out of the European Coal and Steel Community?', choices: ['NATO', 'The Warsaw Pact', 'The European Union', 'The United Nations'], answer: 2, why: 'Economic cooperation among six nations in 1951 expanded step by step into the European Union.' },
      },
    ],
  },

  {
    id: 'ap-afam',
    subject: 'History',
    ap: true,
    icon: 'users',
    title: 'AP African American Studies',
    blurb: 'African American history and culture from early African kingdoms through enslavement, resistance, the freedom struggle, and today\'s debates.',
    level: 'AP · Grades 10 to 12',
    lessons: [
      {
        id: 'exam',
        title: 'The course and exam',
        mins: 5,
        body: `
<p>AP African American Studies is interdisciplinary: history, literature, art, music, political science, and geography. You'll study primary sources like speeches, poems, photographs, and maps.</p>
<ul>
  <li><b>Multiple choice:</b> 60 questions in 70 minutes, most tied to a source (text or image). 60% of the score.</li>
  <li><b>Free response:</b> 4 questions in 80 minutes, including source analysis and an argument essay. 40% of the score.</li>
  <li><b>Individual research project:</b> part of the course, completed in class, but not part of the AP exam score.</li>
</ul>
${tip('When reading a source, always ask: who made it, when, for whom, and why? Then connect it to the broader movement or period.')}`,
        check: { q: 'What kind of course is AP African American Studies?', choices: ['A history-only survey of U.S. presidents', 'An interdisciplinary course using history, literature, arts, and politics', 'A statistics course', 'A world geography course'], answer: 1, why: 'It draws on many disciplines and many kinds of sources to study the African American experience.' },
      },
      {
        id: 'u1',
        title: 'Unit 1: Origins of the African Diaspora',
        mins: 7,
        body: `
<ul>
  <li><b>Africa's diversity:</b> Africa is a huge continent with many geographic regions, languages, and cultures.</li>
  <li><b>Early states:</b> Kush and Aksum; the West African empires of <b>Ghana, Mali</b> (Mansa Musa, Timbuktu as a center of learning), and <b>Songhai</b>, enriched by trans-Saharan trade in gold and salt.</li>
  <li><b>Other societies:</b> the Swahili coast, Great Zimbabwe, and the Kongo kingdom.</li>
  <li><b>Culture:</b> griots preserved history orally; women held significant roles in many societies (for example, Queen Idia of Benin and Queen Njinga of Ndongo and Matamba).</li>
  <li><b>Early contact with Europe:</b> Portuguese trade along the West African coast in the 1400s led to the beginning of the Atlantic slave trade.</li>
</ul>
${rule('This unit counters the idea that African history begins with enslavement. Know the wealth, learning, and political complexity of African states.')}`,
        check: { q: 'What made the Mali Empire wealthy?', choices: ['Silk production', 'Control of trans-Saharan trade in gold and salt', 'Overseas colonies in Asia', 'Oil exports'], answer: 1, why: 'Mali controlled gold fields and trade routes across the Sahara; Mansa Musa\'s wealth became legendary.' },
      },
      {
        id: 'u2',
        title: 'Unit 2: Freedom, Enslavement, and Resistance',
        mins: 8,
        body: `
<ul>
  <li><b>The Middle Passage:</b> the brutal voyage across the Atlantic. About 12.5 million Africans were forced onto ships; about 10.7 million survived.</li>
  <li><b>Slavery in the U.S.:</b> slavery became hereditary and race-based through colonial law. The domestic slave trade split families as cotton expanded.</li>
  <li><b>Culture as resistance:</b> spirituals, family bonds, religion, and storytelling preserved identity.</li>
  <li><b>Resistance:</b> everyday resistance (slowing work), escape (the Underground Railroad, Harriet Tubman), and revolts (the Stono Rebellion 1739, Nat Turner 1831).</li>
  <li><b>Abolitionists:</b> Frederick Douglass, Sojourner Truth, David Walker, and many free Black communities in the North.</li>
  <li><b>The Civil War and emancipation:</b> enslaved people freed themselves by fleeing to Union lines; Black soldiers fought for the Union; the 13th Amendment (1865).</li>
</ul>`,
        check: { q: 'How did spirituals function for enslaved people?', choices: ['Only as entertainment for enslavers', 'As a way to preserve community, faith, and sometimes coded messages', 'As official church music of the colonies', 'They were banned and never sung'], answer: 1, why: 'Spirituals expressed faith and hope, built community, and sometimes carried hidden meanings about escape.' },
      },
      {
        id: 'u3',
        title: 'Unit 3: The Practice of Freedom',
        mins: 8,
        body: `
<ul>
  <li><b>Reconstruction:</b> Black Americans built schools, churches, and businesses, and held office. The 14th and 15th Amendments promised citizenship and the vote.</li>
  <li><b>Backlash:</b> Black Codes, the Ku Klux Klan, sharecropping, and Jim Crow segregation, upheld by <b>Plessy v. Ferguson</b> (1896). Lynching terrorized communities; Ida B. Wells campaigned against it.</li>
  <li><b>Debates over strategy:</b> <b>Booker T. Washington</b> urged economic self-help and vocational education; <b>W.E.B. Du Bois</b> demanded full civil rights and higher education (and helped found the NAACP in 1909).</li>
  <li><b>The Great Migration:</b> millions moved from the rural South to Northern and Western cities.</li>
  <li><b>The Harlem Renaissance</b> (1920s): writers and artists like Langston Hughes, Zora Neale Hurston, and Aaron Douglas celebrated Black culture. Jazz and blues spread nationwide.</li>
  <li><b>Marcus Garvey</b> promoted Black pride and Pan-Africanism.</li>
</ul>`,
        check: { q: 'How did W.E.B. Du Bois\'s approach differ from Booker T. Washington\'s?', choices: ['Du Bois favored accepting segregation for now', 'Du Bois demanded immediate civil rights and higher education', 'Du Bois opposed education entirely', 'They agreed on everything'], answer: 1, why: 'Washington emphasized economic progress first; Du Bois insisted on full political and civil rights right away.' },
      },
      {
        id: 'u4',
        title: 'Unit 4: Movements and Debates',
        mins: 8,
        body: `
<ul>
  <li><b>The civil rights movement:</b> Brown v. Board (1954), the Montgomery Bus Boycott (Rosa Parks, Martin Luther King Jr.), sit-ins (SNCC), the March on Washington (1963), and Selma. Results: the Civil Rights Act (1964) and Voting Rights Act (1965).</li>
  <li><b>Black Power:</b> Malcolm X, Stokely Carmichael, and the Black Panther Party emphasized self-defense, self-determination, and racial pride.</li>
  <li><b>The Black Arts Movement</b> and Black studies programs in universities.</li>
  <li><b>Black feminism:</b> the Combahee River Collective and writers like Audre Lorde examined how race, gender, and class intersect.</li>
  <li><b>Political representation:</b> Shirley Chisholm (first Black woman in Congress, 1968), the Congressional Black Caucus, and Barack Obama's election (2008).</li>
  <li><b>Ongoing debates:</b> reparations, mass incarceration, the Black Lives Matter movement, and the diversity of Black identities across the diaspora.</li>
</ul>
${tip('On the exam, compare strategies: nonviolent direct action vs. Black Power, integration vs. self-determination. Explain the context that shaped each.')}`,
        check: { q: 'What did the Voting Rights Act of 1965 do?', choices: ['Gave women the right to vote', 'Banned literacy tests and added federal oversight of voting in places with a history of discrimination', 'Ended school segregation', 'Created the NAACP'], answer: 1, why: 'It outlawed discriminatory voting practices and allowed federal oversight, dramatically increasing Black voter registration in the South.' },
      },
    ],
  },
];
