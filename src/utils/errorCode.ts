export const errorCode = (errorNum: number) => {
  switch (errorNum) {
    case 63:
      return {
        label: "Tidak ada koneksi internet & tidak ada jaringan yang tersedia",
      };

    case 64:
      return {
        label:
          "Tidak dapat terhubung ke internet. device sedang mencari jaringan baru",
        Solution:
          "Device sedang mencari jaringan agar dapat terhubung ke internet",
      };

    case 65:
      return {
        label: "Registration rejected",
        Solution: "Periksa SIM card atau penyedia layanan",
      };

    case 67:
      return {
        label: "Infrared meter data reception timeout",
        Solution:
          "1. Periksa apakah sensor inframerah sejajar dengan port fotolistrik meteran. \n" +
          "2. Periksa apakah meteran beroperasi normal. /n" +
          "3. Periksa apakah tipe node yang diatur pada pembaca meteran sesuai dengan protokol meteran. \n" +
          "4. Gunakan pembaca meteran untuk membaca meteran lain atau gunakan pembaca meteran lain untuk membaca meteran ini untuk menentukan apakah masalahnya ada pada sensor inframerah.",
      };

    case 68:
      return {
        label: "Infrared meter receiving data error",
        Solution:
          "1. Apakah kesalahan masih terjadi setelah membaca ulang?. \n" +
          "2. Periksa apakah tipe node yang diatur pada pembaca meter sesuai dengan protokol meter. \n" +
          "3. Hubungi dukungan teknis untuk pemecahan masalah.",
      };

    case 69:
      return {
        label: "Infrared meter returns abnormal error code",
        Solution:
          "1. Meter ini tidak mendukung pembacaan item energi yang sesuai; alat pembaca meter dapat digunakan pada meter lain. /n" +
          "2. Hubungi layanan purna jual untuk memperbarui firmware agar mendukung pembacaan meter ini.",
      };

    case 70:
      return {
        label: "Infrared meter protocol type error",
        Solution:
          "1. Periksa apakah tipe node yang diatur pada pembaca meter sesuai dengan protokol meter",
      };

    case 98:
      return {
        label: "Timeout saat upload gambar ke cloud",
        Solution:
          "1. Kekuatan sinyal di bawah -110 atau rasio sinyal terhadap kebisingan di bawah 0 dapat menyebabkan masalah waktu habis (timeout). Mulai ulang perangkat atau tunggu hingga perangkat bangun dan berjalan secara otomatis. \n" +
          "2. Kurangi kualitas gambar (pengaturan terendah) dan ukuran gambar (320*240), atau atur unggahan hanya sebagian dari gambar. \n" +
          "3. Jika waktu habis terjadi beberapa kali berturut-turut, disarankan untuk mengganti perangkat dengan perangkat dari jenis jaringan yang berbeda.",
      };

    case 114:
      return {
        label: "Image configuration retrieval timed out",
        Solution:
          "1. Kekuatan sinyal di bawah -110 atau rasio sinyal terhadap kebisingan di bawah 0 dapat menyebabkan masalah waktu habis (timeout). Mulai ulang perangkat atau tunggu hingga perangkat secara otomatis bangun dan berjalan. \n" +
          "2. Periksa apakah tipe node perangkat sesuai dengan meteran dan perbarui konfigurasinya. \n" +
          "3. Jika waktu habis (timeout) terjadi berulang kali, disarankan untuk mengganti perangkat dengan perangkat dari tipe jaringan yang berbeda.",
      };

    case 146:
      return {
        label: "The reporting result timed out",
        Solution:
          "1. Kekuatan sinyal di bawah -110 atau rasio sinyal terhadap kebisingan di bawah 0 dapat menyebabkan masalah waktu habis (timeout). Mulai ulang perangkat atau tunggu hingga perangkat secara otomatis bangun dan berjalan. \n" +
          "2. Periksa apakah tipe node perangkat sesuai dengan meteran dan perbarui konfigurasinya. \n" +
          "3. Jika waktu habis (timeout) terjadi berulang kali, disarankan untuk mengganti perangkat dengan perangkat dari tipe jaringan yang berbeda.",
      };

    case 162:
      return {
        label: "Error list reporting timed out",
        Solution:
          "1. Kekuatan sinyal di bawah -110 atau rasio sinyal terhadap kebisingan di bawah 0 dapat menyebabkan masalah waktu habis (timeout). Mulai ulang perangkat atau tunggu hingga perangkat secara otomatis bangun dan berjalan. \n" +
          "2. Periksa apakah tipe node perangkat sesuai dengan meteran dan perbarui konfigurasinya. \n" +
          "3. Jika waktu habis (timeout) terjadi berulang kali, disarankan untuk mengganti perangkat dengan perangkat dari tipe jaringan yang berbeda.",
      };

    case 200:
      return {
        label: "Offline",
        Solution:
          "1. Jika perangkat gagal berkomunikasi dengan platform selama dua siklus bangun berturut-turut, statusnya akan berubah menjadi offline. Harap periksa apakah perangkat dapat diaktifkan dan dijalankan (lampu daya atau lampu indikator berjalan menyala). \n" +
          "2. Jika perangkat dapat diaktifkan dan dijalankan secara normal, periksa apakah lampu kilat berkedip dan catat jumlah kedipan; jika lampu kilat berkedip 3 kali, berarti perangkat belum terdaftar di platform; 5 kedipan berarti perangkat gagal bergabung ke jaringan. Lihat metode penanganan kode kesalahan 226.",
      };

    case 202:
      return { label: "The value increased beyond the limit." };

    case 203:
      return { label: "The value decreases below the lower limit" };

    case 226:
      return {
        label: "device tidak dapat terhubung ke internet",
        Solution:
          "1. Kekuatan sinyal di bawah -110 atau rasio sinyal terhadap kebisingan di bawah 0 dapat menyebabkan kegagalan jaringan terus-menerus. Mulai ulang perangkat atau tunggu hingga perangkat bangun dan berjalan secara otomatis. Jika kesalahan tetap terjadi, coba uji di lokasi yang berbeda, hubungi produsen untuk mengganti antena atau wadah kartu SIM, atau gunakan perangkat dengan tipe jaringan yang berbeda. \n" +
          "2. Periksa catu daya. Baterai harus mendukung lebih dari 2500 siklus perangkat. Periksa apakah baterai telah mencapai masa pakainya. \n" +
          "3. Untuk perangkat tipe jaringan CHINA_TELECOM dengan versi firmware V5.4.9, perbarui firmware. 4. Jika kesalahan tipe T tetap terjadi, kembalikan perangkat untuk diperbaiki.",
      };

    case 228:
      return {
        label: "device timeout",
        Solution:
          "1. Kekuatan sinyal di bawah -110 atau rasio sinyal terhadap kebisingan di bawah 0 dapat menyebabkan kegagalan jaringan terus-menerus. Mulai ulang perangkat atau tunggu hingga perangkat bangun secara otomatis. Jika kesalahan terjadi terus-menerus, coba uji di lokasi yang berbeda, atau hubungi produsen untuk mengganti antena atau wadah kartu SIM, atau gunakan perangkat dengan jenis jaringan yang berbeda. \n" +
          "2. Periksa catu daya. Baterai harus mendukung perangkat selama lebih dari 2500 siklus. Periksa apakah baterai telah mencapai masa pakainya.",
      };

    case 236:
      return { label: "No image configuration file" };

    case 237:
      return { label: "Configuration file parameter error" };

    case 238:
      return {
        label: "pembacaan error, tidak dapat mendeteksi meteran air",
        Solution:
          "1. Periksa apakah tipe node yang diatur pada pembaca meteran sesuai dengan tipe meteran. \n" +
          "2. Jika itu adalah meteran kamera, hubungi administrator untuk memperbarui mode pengenalan;\n" +
          "3. Jika itu adalah pembaca meteran inframerah, periksa apakah probe inframerah sejajar dengan port fotolistrik meteran;\n" +
          "4. Jika itu adalah pembaca meteran inframerah, gunakan pembaca meteran tersebut untuk membaca meteran lain atau gunakan pembaca meteran lain untuk membaca meteran ini untuk menentukan apakah masalahnya ada pada probe inframerah.",
      };

    case 253:
      return { label: "Failed to obtain infrared meter address" };

    case 254:
      return {
        label:
          "Infrared meter response error/unknown error, AT response timeout",
      };

    case 255:
      return { label: "Unknown error, AT reply failed." };

    case 300:
      return {
        label: "gagal mendeteksi meteran air",
        Solution:
          "1. Periksa apakah tipe node sesuai dengan meteran. \n" +
          "2. Merujuk pada error code 236 untuk memperbarui konfigurasi gambar. \n" +
          "3. Jika masih belum ada hasil pengenalan setelah memperbarui konfigurasi gambar, silakan hubungi administrator platform untuk diproses.",
      };

    case 500:
      return { label: "Backend service error" };

    default:
      return { label: "UNKNOWN", color: "badge-ghost", icon: "❔" };
  }
};
