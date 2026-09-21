// Data jadwal resmi PTS Ganjil 2026-2027.
// Format: RUANG|nama jam 1|nama jam 2|...
const SCHEDULE_DATA = {
SMA: [
"1|Barirotul Choiriyah, S.E|Ir. Rachmawati, M.Pd|Ahdini Rahmatillah Lc. S.S|Verary Pratama Putri S.E|Nurlaila, SM M.Pd|Sadam Hamzah, S.Hi|Verary Pratama Putri S.E|Venty Rahmawati, M.Pd|Aini Syifa, S.S|Lulu Zahrotunnisa, S.Pd|Barirotul Choiriyah, S.E",
"2|Lulu Zahrotunnisa, S.Pd|Barirotul Choiriyah, S.E|Barirotul Choiriyah, S.E.t|Ahdini Rahmatillah Lc. S.S|Venty Rahmawati, M.Pd|Nurlaila, SM M.Pd|Sadam Hamzah, S.Hi|Nurlaila, SM M.Pd|Venty Rahmawati, M.Pd|M. Hidayatu Rusydi, S.H|Lulu Zahrotunnisa, S.Pd",
"3|Nailul Kunni Fureida, S.Gz|Lulu Zahrotunnisa, S.Pd|Nailul Kunni Fureida, S.Gz|Barirotul Choiriyah, S.E.t|Muhammad Suhail, S.Pd.l|Venty Rahmawati, M.Pd|Nurlaila, SM M.Pd|Ir. Rachmawati, M.Pd|Nurlaila, SM M.Pd|Muhammad Farid, S.Pd.l|M. Hidayatu Rusydi, S.H",
"4|Rizki Karomah, S.Si|Nailul Kunni Fureida, S.Gz|Rizki Karomah, S.Si|Nailul Kunni Fureida, S.Gz|Verary Pratama Putri S.E|Muhammad Suhail, S.Pd.l|Venty Rahmawati, M.Pd|Rizki Karomah, S.Si|Ir. Rachmawati, M.Pd|Fadhilah, S.Pd|Muhammad Farid, S.Pd.l",
"5|Ir. Rachmawati, M.Pd|Rizki Karomah, S.Si|Verary Pratama Putri S.E|Rizki Karomah, S.Si|Sadam Hamzah, S.Hi|Verary Pratama Putri S.E|Muhammad Suhail, S.Pd.l|Aini Syifa, S.S|Rizki Karomah, S.Si|Barirotul Choiriyah, S.E|Fadhilah, S.Pd",
"6|Bayu Nirpana, S.H., M.H|Ichsanul Afief, S.Sos|Fadilah Abidana, S.S.,M.Pd|Bayu Nirpana, S.H., M.H|Hamzah Robani, S.Sos, L.c, M.Kom|Fadilah Abidana, S.S.,M.Pd|M. Irham Al Baihaqi|Isnan Aprizal Hafizh|Ahmad Lujaenilma, S.Kom|Isnan Aprizal Hafizh|Ahmad Hasan Munjaji",
"7|Fadilah Abidana, S.S.,M.Pd|Bayu Nirpana, S.H., M.H|M. Hanif Fauzi, M.Pd|Fadilah Abidana, S.S.,M.Pd|Ahmad Lujaenilma, S.Kom|Hamzah Robani, S.Sos, L.c, M.Kom|Fadilah Abidana, S.S.,M.Pd|Khairil Fahmi, S.Pd|Isnan Aprizal Hafizh|Muhammad Suhail, S.Pd.l|Isnan Aprizal Hafizh",
"8|Khairil Fahmi, S.Pd|Fadilah Abidana, S.S.,M.Pd|Doni Subiyanto, S.E|M. Hanif Fauzi, M.Pd|Muhammad Akbar Al-Ghifari|Ahmad Lujaenilma, S.Kom|Hamzah Robani, S.Sos, L.c, M.Kom|Sadam Hamzah, S.Hi|Almaas Jhoung Asri|Rifqi Rahmatuloh|Muhammad Suhail, S.Pd.l",
"9|M. Hanif Fauzi, M.Pd|Khairil Fahmi, S.Pd|Fadhilah, S.Pd|Doni Subiyanto, S.E|M. Irham Al Baihaqi|Muhammad Akbar Al-Ghifari|Ahmad Lujaenilma, S.Kom|M. Hidayatu Rusydi, S.H|Sadam Hamzah, S.Hi|Khairil Fahmi, S.Pd|Rifqi Rahmatuloh",
"10|Ichsanul Afief, S.Sos|M. Hanif Fauzi, M.Pd|Bayu Nirpana, S.H., M.H|Fadhilah, S.Pd|Fadilah Abidana, S.S.,M.Pd|M. Irham Al Baihaqi|Muhammad Akbar Al-Ghifari|Ahmad Lujaenilma, S.Kom|M. Hidayatu Rusydi, S.H|Ahmad Hasan Munjaji|Khairil Fahmi, S.Pd"
],
SMP: [
"11|Nur Azizah, S.Pd|Alfi Nurfadilah|Salwa Binta Tsania|Subhan, S.Pd|Syafon Oktavia Rahma|Siti Nurzulfiah, S.Pd.I|Siti Halimah, S.Si., S.Pd|Siti Fatimah Zahra|Nazwa Yunita|Siti Fatimah Zahra",
"12|Subhan, S.Pd|Nur Azizah, S.Pd|Fiqih Kartika Murni, S.Pd|Salwa Binta Tsania|Anisa Siti Nabilah, S.Pd|Syafon Oktavia Rahma|Siti Nurzulfiah, S.Pd.I|Aulia Sabila Mufida|Aini Syifa, S.S|Nazwa Yunita",
"13|Fiqih Kartika Murni, S.Pd|Subhan, S.Pd|Nur Azizah, S.Pd|Fiqih Kartika Murni, S.Pd|Dea Amanda Putri|Anisa Siti Nabilah, S.Pd|Syafon Oktavia Rahma|Ilmi Miftahul Jannah|Aulia Sabila Mufida|Aini Syifa, S.S",
"14|Siti Fatimah Zahra|Fiqih Kartika Murni, S.Pd|Aini Syifa, S.S|Nur Azizah, S.Pd|Ilmi Miftahul Jannah|Dea Amanda Putri|Anisa Siti Nabilah, S.Pd|Siska Yunita Dewi|Silmi Sabila|Aulia Sabila Mufida",
"15|Syafon Oktavia Rahma|Siti Fatimah Zahra|Rahmati Kurrata'Aini, .S|Aini Syifa, S.S|Ahmad Sukanta, S.Pd|Ilmi Miftahul Jannah|Dea Amanda Putri|Nazwa Yunita|Siti Halimah, S.Si., S.Pd|Silmi Sabila",
"16|Rahmati Kurrata'Aini, .S|Syafon Oktavia Rahma|Siska Indriyani, S.Sos|Rahmati Kurrata'Aini, .S|Siska Yunita Dewi|Ahmad Sukanta, S.Pd|Ilmi Miftahul Jannah|Alfi Nurfadilah|Siti Nurzulfiah, S.Pd.1|Siti Halimah, S.Si., S.Pd",
"17|Siska Indriyani, S.Sos|Rahmati Kurrata'Aini, .S|Alfi Nurfadilah|Siska Indriyani, S.Sos|Siti Halimah, S.Si., S.Pd|Siska Yunita Dewi|Ahmad Sukanta, S.Pd|Ahdini Rahmatillah Lc. S.S|Dea Amanda Putri|Siti Nurzulfiah, S.Pd.1",
"18|Alfi Nurfadilah|Siska Indriyani, S.Sos|Subhan, S.Pd|Alfi Nurfadilah|Siti Nurzulfiah, S.Pd.I|Siti Halimah, S.Si., S.Pd|Siska Yunita Dewi|Syafon Oktavia Rahma|Siti Fatimah Zahra|Dea Amanda Putri",
"19|Muhammad Ihsan|Muhamad Mashur|Almaas Jhoung Asti|Moh Afriza Tri Wardana|Almaas Jhoung Asti|M. Alief Nugraha, S.H|Hammad lyyad Faiji|Muhammad Ihsan|Muhammad Fikri Al- Anshory|Ahmad Sukanta, S.Pd",
"20|Fathurachman, S.Pd|Muhammad Ihsan|Abdul Hariz Naufal S.Ag|Almaas Jhoung Asti|Noor Faiz, S.Pd|Almaas Jhoung Asti|M. Alief Nugraha, S.H|Muhammad Zaki|Nurizal Muzaki|Muhammad Fikri Al- Anshory",
"21|Ahmad Hasan Munjaji|Fathurachman, S.Pd|Fathurachman, S.Pd|Abdul Hariz Naufal S.Ag|Subhan, S.Pd|Noor Faiz, S.Pd|Almaas Jhoung Asti|Abdul Fattah Azzam|Muhamad Mashur|Nurizal Muzaki",
"22|Muhamad Mashur|Ahmad Hasan Munjaji|Ade Ihsan Firdaus|Fathurachman, S.Pd|Abdul Hariz Naufal S.Ag|Subhan, S.Pd|Noor Faiz, S.Pd|Noor Faiz, S.Pd|Muhammad Zaki|Muhamad Mashur",
"23|Fahru Roji Malik S.M|Muhamad Mashur|Toni, S.Pd|Ade Ihsan Firdaus|Muhamad Mashur|Abdul Hariz Naufal S.Ag|Subhan, S.Pd|Ade Ihsan Firdaus|Ade Ihsan Firdaus|Muhammad Zaki",
"24|Toni, S.Pd|Fahru Roji Malik S.M|Hammad lyyad Faiji|Toni, S.Pd|Muhammad Zaki|Muhamad Mashur|Abdul Hariz Naufal S.Ag|Muhammad Fikri Al- Anshory|Hammad lyyad Faiji|Ade Ihsan Firdaus",
"25|M. Alief Nugraha, S.H|Toni, S.Pd|Abdul Fattah Azzam|Hammad lyyad Faiji|Hammad lyyad Faiji|Muhammad Zaki|Muhamad Mashur|Fathurachman, S.Pd|M. Jaelani Basri, S.Pd|Hammad lyyad Faiji",
"26|Muhamad Mashur|M. Alief Nugraha , S.H|Moh Afriza Tri Wardana|Abdul Fattah Azzam|M. Alief Nugraha, S.H|Hammad lyyad Faiji|Muhammad Zaki|Abdul Fattah Azzam|Ahmad Sukanta, S.Pd|M. Jaelani Basri, S.Pd"
]};