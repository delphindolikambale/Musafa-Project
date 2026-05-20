package com.school.management.util;

import java.math.BigDecimal;
import java.text.DecimalFormat;

public class NumberToWords {

    private static final String[] tensNames = {
            "", " dix", " vingt", " trente", " quarante", " cinquante", " soixante", " soixante-dix", " quatre-vingt", " quatre-vingt-dix"
    };

    private static final String[] numNames = {
            "", " un", " deux", " trois", " quatre", " cinq", " six", " sept", " huit", " neuf", " dix",
            " onze", " douze", " treize", " quatorze", " quinze", " seize", " dix-sept", " dix-huit", " dix-neuf"
    };

    private static String convertLessThanOneThousand(int number) {
        String soFar;

        if (number % 100 < 20) {
            soFar = numNames[number % 100];
            number /= 100;
        } else {
            soFar = numNames[number % 10];
            number /= 10;
            soFar = tensNames[number % 10] + soFar;
            number /= 10;
        }
        if (number == 0) return soFar;

        // En français : on ne dit pas "Un cent" mais "Cent"
        String hundredPrefix = (number == 1) ? "" : numNames[number];
        return (hundredPrefix + " cent" + soFar).trim();
    }

    public static String convert(BigDecimal amount, String currency) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) == 0) {
            return "Zéro " + getCurrencyName(currency, false);
        }

        long totalAmount = amount.longValue();
        // Récupération des centimes
        int cents = amount.remainder(BigDecimal.ONE).multiply(new BigDecimal(100)).abs().intValue();

        String result = convertLong(totalAmount);
        result += " " + getCurrencyName(currency, totalAmount > 1);

        if (cents > 0) {
            result += " et " + convertLong(cents) + " Centimes";
        }

        // Mise en majuscule de la première lettre seulement
        String finalResult = result.trim().replaceAll("\\s+", " ");
        return finalResult.substring(0, 1).toUpperCase() + finalResult.substring(1);
    }

    private static String convertLong(long number) {
        if (number == 0) return "zéro";

        String mask = "000000000000";
        DecimalFormat df = new DecimalFormat(mask);
        String snumber = df.format(number);

        // Division par groupes de 3 chiffres (milliards, millions, milliers, unités)
        int billions = Integer.parseInt(snumber.substring(0, 3));
        int millions = Integer.parseInt(snumber.substring(3, 6));
        int thousands = Integer.parseInt(snumber.substring(6, 9));
        int rest = Integer.parseInt(snumber.substring(9, 12));

        String tradBillions = (billions == 0) ? "" : convertLessThanOneThousand(billions) + (billions > 1 ? " milliards " : " milliard ");
        String tradMillions = (millions == 0) ? "" : convertLessThanOneThousand(millions) + (millions > 1 ? " millions " : " million ");

        // En français : "Mille" est invariable et on ne dit pas "Un mille"
        String tradThousands = "";
        if (thousands == 1) {
            tradThousands = "mille ";
        } else if (thousands > 1) {
            tradThousands = convertLessThanOneThousand(thousands) + " mille ";
        }

        String tradRest = convertLessThanOneThousand(rest);

        return (tradBillions + tradMillions + tradThousands + tradRest).trim();
    }

    private static String getCurrencyName(String currency, boolean plural) {
        if (currency == null) return "";
        switch (currency.toUpperCase()) {
            case "USD": return plural ? "Dollars" : "Dollar";
            case "CDF": return plural ? "Francs Congolais" : "Franc Congolais";
            default: return currency;
        }
    }

}
